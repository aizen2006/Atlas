import { Runner , type Agent} from '@openai/agents'
import 'dotenv/config';


const runner = new Runner()

export async function agentRunner(agent:Agent,prompt:string){
    try {
        const result = await runner.run(
            agent,
            prompt
        );
        return result.finalOutput
    } catch (error) {
        throw error
    }
};