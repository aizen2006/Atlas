import { Atlas } from "./agent";
import { agentRunner } from "./utils/runner";

const userPrompt=`Can book a event in calender named meeting with Abhik tomorrow at 9am ,Asia/Kolkata`

const output = await agentRunner(Atlas,userPrompt)

console.log(output)