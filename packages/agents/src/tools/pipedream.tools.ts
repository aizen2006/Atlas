import { tool , type Tool } from "@openai/agents";
import { client } from "../utils/pipedream";
import z from "zod";

export const listToolsMCP : Tool = tool({
    name:"listMCPTools",
    description: `
        Discover the available MCP tools and components for a given application.
        Use this tool when you need to understand what actions an app supports before executing any operation.
        `,
    parameters:z.object({
        appSlug:z.string()
    }),
    async execute({appSlug}){
        try {
            const components = await client.components.list({ q: appSlug });
            return components
        } catch (error) {
            return error
        }
    }
})
