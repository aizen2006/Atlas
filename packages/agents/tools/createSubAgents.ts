import { tool , run } from "@openai/agents";
import { compaction, filesystem, Manifest, memory, SandboxAgent, shell, skills } from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";
import z from "zod";
import { webSearch } from "./webSearchTools";

// research more on agents manifest 

export const createSubAgents = tool({
    name:`CreateSubAgents`,
    description:``,
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