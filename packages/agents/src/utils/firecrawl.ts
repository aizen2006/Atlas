import { Firecrawl } from 'firecrawl';
import 'dotenv/config';


if(!process.env.FIRECRAWL_API_KEY) {
    throw Error("The Firecrawl api key is empty");
}

export const firecrawl = new Firecrawl({apiKey:process.env.FIRECRAWL_API_KEY!})