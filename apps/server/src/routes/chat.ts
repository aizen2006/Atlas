import { Hono } from "hono";
import { openai } from "../utils/openai";


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


// for non streaming ( intially )
chat.post('/',async(c)=>{
    const query = await c.req.text();
    const prompt = `
    UserQuery:{{query}}

    Plan:{{plan}}

    Context:{{memory}}

    Skills:{{skills}}

    Conversation:{{converstion}}
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
    render(prompt,{
        query:response.output_text
    });
    // 


})

// for streaming ( later stage)



export default chat;