import { Agent } from '@openai/agents'
import { z } from "zod";
import { webSearch , webScrape ,agenticSearch } from './tools/webSearchTools';

const outputType = z.object({})

export const Atlas = new Agent({
    name:"Atlas : AI executive assistant",
    instructions:``,
    tools:[webScrape,webSearch,agenticSearch],
    model:"gpt-5-mini",
    outputType:outputType
})