import { tool } from "@openai/agents";
import { z } from "zod";
import { db , skills } from "@repo/memory";
import { eq } from "drizzle-orm";


interface SkillList {
    id:number,
    name:string,
    description:string | null,
    path:string,
    successRate:number | null,
    usageCount:number | null
}

export const getSkills = tool({
    name:"Get Skills",
    description:`Fetch's the skils from the database with there descriptions `,
    parameters:z.object(),
    async execute(){
        try {
            const skills_list: SkillList[] = await db.select({
                id:skills.id,
                name:skills.name,
                description:skills.description ,
                path:skills.path,
                successRate:skills.successRate,
                usageCount:skills.usageCount
            })
            .from(skills)
            .where(
                eq(skills.enabled,true)
            );
            return skills_list;
        } catch (error) {
            console.error(error);
            return {
                message:"Failed to get skills, try again",
                error:error
            }
        }
    }
});

export const addSkill = tool({
    name:"Add Skill",
    description:``,
    parameters:z.object(),
    execute(){}
});
export const loadSkill = tool({
    name:"Load Skill",
    description:``,
    parameters:z.object(),
    execute(){}
});
// use with caution
export const removeSkill = tool({
    name:"Add Skill",
    description:``,
    parameters:z.object(),
    execute(){}
});