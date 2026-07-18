import { Runner , type Agent } from '@openai/agents'
import { session } from './sessions';
import 'dotenv/config';

const runner = new Runner()


// later add proper type for agentRunner

export async function agentRunner(agent:Agent,prompt:string):Promise<any>{
    try {
        const result = await runner.run(
            agent,
            prompt,{
                session,
                stream:true
            },
        );
        if(!result.toTextStream({compatibleWithNodeStreams:true})){
            return "Output is Undefined // Failed to generate the result"
        }else{
            return result.toTextStream({ compatibleWithNodeStreams: true })
        } 
    } catch (error) {
        throw error
    }
};