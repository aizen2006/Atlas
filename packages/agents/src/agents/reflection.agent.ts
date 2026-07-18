import { Agent  } from "@openai/agents";
import { z } from "zod"

const reflectionOutput = z.object({
    text:z.string()
}) 


export const reflection_agent = new Agent({
    name:"Planner Agent",
    instructions:``,
    model:'gpt-5.4-mini',
    outputType:reflectionOutput
})