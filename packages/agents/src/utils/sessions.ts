import { OpenAIConversationsSession ,type Session } from "@openai/agents";
import 'dotenv/config'

if(!process.env.OPENAI_API_KEY) console.log("Openai key missing")

// later convert to SQlite

export const session : Session = new OpenAIConversationsSession({
    apiKey:process.env.OPENAI_API_KEY,
    conversationId:process.env.CONV_ID
});

// const sessionId = await session.getSessionId()
