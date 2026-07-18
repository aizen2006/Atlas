import { tool , type Tool } from "@openai/agents"
import z from 'zod';


export const workflowTool : Tool = tool({
    name:'Workflow Creation Tool',
    description:``,
    parameters:z.object(),
    execute(){}
})