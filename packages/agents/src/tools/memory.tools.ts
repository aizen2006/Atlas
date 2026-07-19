import { tool } from "@openai/agents";
import z from "zod";


export const getMemory = tool({
    name:"Get Memory",
    description:`Use it to search and retrive relevent info of memory
    Use's Semantic search to retrive relevent data with high similarity score
    `,
    parameters:z.object(),
    async execute(){}
})