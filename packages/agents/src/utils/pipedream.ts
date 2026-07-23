import { PipedreamClient } from '@pipedream/sdk';
import '@repo/config';

export interface connectURL{
    message:string
    url:string
    expireAt:Date
}

export const client = new PipedreamClient({
    projectEnvironment: "development",
    clientId: process.env.PIPEDREAM_CLIENT_ID,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
    projectId: process.env.PIPEDREAM_PROJECT_ID,
});


export async function tokens(){
    try {
        const { token, expiresAt, connectLinkUrl } = await client.tokens.create({
            externalUserId: process.env.PIPEDREAM_USER_ID!,
        });
        return { token , expiresAt , connectLinkUrl}
    } catch (error) {
        throw error
    }
};

export async function appConnectUrl(app:string):Promise<connectURL>{
    const { token , expiresAt , connectLinkUrl}=await tokens();
    const url=connectLinkUrl+`&app=${app}`;
    return {
        message:"Use this link to connect to your account , valid for 4 hr",
        url:url,
        expireAt:expiresAt
    }
}