import { Agent  } from "@openai/agents";
import { z } from "zod"

const reflectionOutput = z.object({
    text:z.string()
}) 


export const reflection_agent = new Agent({
    name:"Reflection Agent",
    instructions:``,
    model:'gpt-5.4-mini',
    outputType:reflectionOutput
})