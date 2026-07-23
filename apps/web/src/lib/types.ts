// What the server's pipeline decided for a turn — mirrors the `pipeline` field
// on the /chat response and the `meta` SSE event.
export interface PipelineSummary {
    planned: boolean;
    memoriesUsed: number;
    skills: string[];
}

export type Role = "user" | "agent";

export interface ChatMessage {
    id: string;
    role: Role;
    content: string;
    pipeline?: PipelineSummary; // agent turns only
    error?: string; // set when the turn failed
}
