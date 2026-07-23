import OpenAI from "openai";
import { env } from "@repo/config";

if (!env.OPENAI_API_KEY) throw new Error("Failed to Load OpenAi Key");

export const openai: OpenAI = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});
