import { Hono } from "hono";
import { openai } from "../libs/openai";
import { runAgent , planner_agent, Atlas, reflection_agent } from "@repo/agents";
import { db, messages, sessions, jobs, experiences } from "@repo/memory";
import { eq } from "drizzle-orm";
import { searchMemory, loadSkills, createMemory } from "../libs/utils";

const chat = new Hono();

function render(
    template: string,
    variables: Record<string, string>
) {
    return template.replace(
    /{{(\w+)}}/g,
    (_, key) => variables[key] ?? `{{${key}}}`
    );
}

// the Flow 
// Query 
// -> planner 
// -> optimze the Prompt & load skill's and memory 
// -> send's to LLM and returns response
// -> create a job -> create's experience 
// -> call reflection agent 
// -> Create's Memory 
// -> End
interface Conversation {
    role:"agent" | "user" | null,
    content:string | null
}

// for non streaming ( intially )
chat.post('/',async(c)=>{
    try {
        // Validation
        const body = await c.req.json();
        let { query , sessionId } = body;
        let conversations : Conversation[] = [] ;
        const title = await openai.responses.create({
            model:"gpt-5.4-nano",
            instructions:"Your role is to analyze the user's query and derive a sutable title for this conversation",
            input:query,
            reasoning:{
                effort:"none"
            }
        });
        //Check's sessionId & create a new if not exists
        if (!sessionId){
            const [session] = await db.insert(sessions).values({title:title.output_text}).returning({id:sessions.id});
            if(!session) throw new Error("Failed to create session");
            sessionId = session.id;
        }else{
            conversations = await db
                .select({role:messages.role,content:messages.content})
                .from(messages)
                .where(eq(messages.sessionId,sessionId));
        }
        // store's the user's message
        await db.insert(messages).values({sessionId:sessionId,role:"user",content:query});
        let prompt = `
        UserQuery:{{query}}

        Plan:{{plan}}

        Context:{{memory}}

        Skills:{{skills}}

        Conversation:${conversations}
        `
        //Optimize the Prompt  
        const response = await openai.responses.create({
            model: 'gpt-5.6-luna',
            instructions: `
            You are an expert AI Prompt Engineer and Query Optimizer. Your job is to analyze poorly phrased, vague, or inefficient user queries and rewrite them into highly effective, clear, and actionable prompts that yield the best possible AI responses.

            ### Optimization Rules:
            1. Clarify intent and fill in missing context.
            2. Define a clear role/persona for the AI if necessary.
            3. Specify the desired format, tone, or constraints.
            4. Keep it concise but comprehensive.

            ### Examples:

            [Input Query]: "Can you help"
            [Optimized Prompt]: "I need assistance with a task. Please ask me 2-3 clarifying questions to understand what I am trying to achieve so you can help me effectively."

            [Input Query]: "write an email to my boss about being sick"
            [Optimized Prompt]: "Write a professional and polite email to my manager informing them that I cannot come to work today due to illness. Keep it brief, mention that I will check my emails periodically if urgent, and thank them for understanding."

            [Input Query]: "python loop"
            [Optimized Prompt]: "Explain how a 'for' loop works in Python. Provide a simple, real-world code example and break down the syntax step-by-step for a beginner."

            [Input Query]: {{USER_QUERY}}
            [Optimized Prompt]:
            `,
            input: query,
            reasoning:{effort:"low"}
        });
        // inject the query into the prompt
        prompt = render(prompt,{
            query:response.output_text
        });
        // planner agent
        const planner_output = await runAgent(planner_agent,response.output_text);
        // checks if plans exist and injects the plan into the prompt
        if(planner_output?.resources.plan){
            if(!planner_output.plan) throw new Error("Failed to get the plan")
            prompt = render(prompt,{
                plan:planner_output.plan
            });
        }
        // Memory layer
        if(planner_output?.resources.memory){
            // later make the number of results returned dynamic
            const memoryHits = await searchMemory(query,3);
            prompt = render(prompt,{
                memory: memoryHits.length
                    ? memoryHits.map(m=>`- ${m.content}`).join("\n")
                    : "No relevant memory found."
            });
        }
        // skills layer
        if(planner_output?.resources.skills && planner_output.skills.length){
            const skillNames = planner_output.skills.map(s=>s.name);
            const loadedSkills = await loadSkills(skillNames);
            prompt = render(prompt,{
                skills: loadedSkills.length
                    ? loadedSkills.map(s=>`### ${s.name}\n${s.content}`).join("\n\n")
                    : "No relevant skills found."
            });
        }

        // call main agent layer
        const main_output = await runAgent(Atlas,prompt);
        if(!main_output) throw new Error("Failed to get a response from Atlas");

        // store's the agent's reply
        await db.insert(messages).values({sessionId,role:"agent",content:main_output});

        // create a job -> create's experience -> call reflection agent -> Create's Memory
        // runs after the response is sent, so it never adds latency to the client
        void runReflectionPipeline(sessionId,query,main_output);

        return c.json({sessionId,response:main_output});
    } catch (error) {
        console.error(error);
        return c.json({message:"Failed to process the request"},500);
    }
})

// for streaming ( later stage)
chat.post('/stream',async(c)=>{})

async function runReflectionPipeline(sessionId:number,task:string,result:string){
    let jobId: number | undefined;
    try {
        // create a job
        const [job] = await db.insert(jobs).values({
            type:"reflect",
            payload:{sessionId,task},
            status:"running"
        }).returning({id:jobs.id});
        if(!job) throw new Error("Failed to create job");
        jobId = job.id;

        // create's experience
        const [experience] = await db.insert(experiences).values({
            sessionId,
            task,
            success:true,
            result
        }).returning({id:experiences.id});
        if(!experience) throw new Error("Failed to create experience");

        // call reflection agent
        const reflection_output = await runAgent(reflection_agent,`
        Task: ${task}

        Result: ${result}
        `);

        if(reflection_output?.text){
            await db.update(experiences)
                .set({reflection:reflection_output.text})
                .where(eq(experiences.id,experience.id));

            // Create's Memory
            await createMemory({
                content:reflection_output.text,
                category:"workflow",
                sourceExperienceId:experience.id
            });
        }

        await db.update(jobs)
            .set({status:"completed",completedAt:new Date()})
            .where(eq(jobs.id,job.id));
    } catch (error) {
        console.error("Reflection pipeline failed",error);
        if(jobId !== undefined){
            await db.update(jobs)
                .set({status:"failed",error:String(error)})
                .where(eq(jobs.id,jobId));
        }
    }
}

export default chat;