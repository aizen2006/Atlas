import { Agent  } from "@openai/agents";
import { z } from "zod"
import { skillmanager } from "./skillmanager";
const plannerOutput = z.object({
    text:z.string()
}) 

const skillManagerTool = skillmanager.asTool({
    toolName:"Skill Manager",
    toolDescription:`The role of this tool is to analyze if a tool is needed for this query and
    if needed load the relvent skill in the context of the agent`
})

export const planner_agent = new Agent({
    name:"Planner Agent",
    instructions:``,
    model:'gpt-5.4-mini',
    tools:[
        skillManagerTool
    ],
    outputType:plannerOutput
})