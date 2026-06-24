import { Runner , type Agent} from '@openai/agents'
import { session } from './sessions';
import 'dotenv/config';

const runner = new Runner()

export async function agentRunner(agent:Agent,prompt:string):Promise<string>{
    try {
        const result = await runner.run(
            agent,
            prompt,{
                session
            }
        );
        if(!result.finalOutput){
            return "Output is Undefined // Failed to generate the result"
        }else{
            return result.finalOutput
        } 
    } catch (error) {
        throw error
    }
};