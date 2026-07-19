import { tool , run ,type Tool} from "@openai/agents";
import { compaction, filesystem, Manifest, memory, SandboxAgent, shell, skills } from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";
import z from "zod";
import { webSearch } from "./webSearch.tools";

// research more on agents manifest 

export const createSubAgents : Tool = tool({
    name:`CreateSubAgents`,
    description: `
        Create and execute a specialized sub-agent for a focused task.

        Use this tool when the requested task is complex, requires deep reasoning, independent execution, multi-step planning, extensive web research, code analysis, or would benefit from delegating work to a dedicated expert agent.

        The sub-agent receives its own identity, system instructions, and base instructions, allowing it to work independently while remaining specialized for the assigned objective.

        Examples of suitable tasks:
        - Large-scale code analysis or refactoring
        - Researching a topic from multiple sources
        - Generating technical documentation
        - Reviewing architecture or security
        - Planning features or writing implementation strategies
        - Debugging complex issues
        - Long-running reasoning tasks
        - Tasks that should be isolated from the main conversation context

        Do NOT use this tool for:
        - Simple factual questions
        - Basic calculations
        - Short conversations
        - Tasks that can be completed directly in a single response
        - User-facing chat that doesn't require specialization

        Parameters:
        - name: A short descriptive name for the specialized agent.
        - instructions: The complete system instructions defining the agent's expertise, behavior, goals, and constraints.
        - baseInstructions: Shared foundational instructions inherited by the sub-agent.
        - query: The task the sub-agent should execute.
        `,
    parameters:z.object({
        query:z.string(),
        name:z.string(),
        instructions:z.string(),
        baseInstructions:z.string()
    }),
    async execute({instructions,query,baseInstructions,name}){
        const agent = new SandboxAgent({
            name:name,
            model:"gpt-5.4",
            instructions:instructions,
            baseInstructions:baseInstructions,
            capabilities:[shell(),filesystem(),memory(),compaction()],
            tools:[webSearch]
        });

        const result = await run(agent,query,{
            sandbox:{
                client: new UnixLocalSandboxClient(),
            }
        })
        return result.finalOutput
    }
})