import { Agent } from '@openai/agents'
import { z } from "zod";
import { webSearch , webScrape ,agenticSearch } from './tools/webSearchTools';
// Will define later 
const outputType = z.object({})

const atlas = new Agent({
    name:"Atlas : AI executive assistant",
    instructions:``,
    tools:[webScrape,webSearch,agenticSearch],
    model:"gpt-5-mini",
    outputType:outputType
})