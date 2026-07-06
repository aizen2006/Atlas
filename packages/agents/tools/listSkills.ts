import { tool, type Tool } from '@openai/agents';
import z from 'zod';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.resolve(__dirname, '../../skills');

export const listskills: Tool = tool({
    name: 'list_skills',
    description: `List all skills available to Atlas. Returns each skill's name and
        description so the Skill Manager can decide which skills (if any) are relevant to
        the user's request. Takes no arguments.`,
    parameters: z.object({}),
    async execute() {
        try {
            const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
            const skills: { name: string; description: string }[] = [];
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                try {
                    const raw = await readFile(
                        path.join(SKILLS_DIR, entry.name, 'SKILL.md'),
                        'utf-8'
                    );
                    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
                    if (!fm) continue;
                    const block = fm[1]!;
                    const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? entry.name;
                    const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? '';
                    skills.push({ name, description });
                } catch {
                    continue; // no SKILL.md / unreadable → skip this folder
                }
            }
            return skills;
        } catch (error) {
            return error;
        }
    },
});
