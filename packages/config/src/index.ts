// The single source of truth for environment config and model ids.
//
// Importing this module (for its side effect, or for `env` / `models`) loads
// the project's .env files from ABSOLUTE paths, so a process gets identical
// config no matter which directory it was started from. The `npm run atlas`
// launcher runs from the repo root while `bun run dev` runs from apps/server —
// both must see the same keys and the same database.
import { config as loadDotenv } from "dotenv";
import { existsSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

// packages/config/src -> repo root is three levels up.
export const REPO_ROOT = resolve(import.meta.dir, "../../..");

// dotenv does not override already-set variables, so files earlier in this list
// win. Real secrets currently live in the package-level .env files; a repo-root
// .env (if present) is loaded first as an override.
for (const file of [
    join(REPO_ROOT, ".env"),
    join(REPO_ROOT, "packages/agents/.env"),
    join(REPO_ROOT, "packages/memory/.env"),
]) {
    if (existsSync(file)) loadDotenv({ path: file });
}

// One OpenAI key, two names: apps/server/src/libs/openai.ts reads `OPENAI`,
// while the @openai/agents SDK reads `OPENAI_API_KEY`. Mirror whichever the
// user provided onto the other so a single .env entry is enough.
const openaiKey = process.env.OPENAI_API_KEY ?? process.env.OPENAI;
if (openaiKey) {
    process.env.OPENAI_API_KEY ??= openaiKey;
    process.env.OPENAI ??= openaiKey;
}

// Resolve the SQLite path to an absolute location. A relative DB_FILE_NAME
// resolved against cwd is exactly how the server silently opens a fresh, empty
// database when launched from the wrong directory.
function resolveDbPath(): string {
    const fallback = join(REPO_ROOT, "packages/memory/src/memory.db");
    const raw = process.env.DB_FILE_NAME;
    if (!raw) return fallback;
    if (isAbsolute(raw)) return raw;
    // Historical relative values were written against packages/memory (the
    // drizzle-kit cwd), so try there first, then the repo root.
    for (const base of [join(REPO_ROOT, "packages/memory"), REPO_ROOT]) {
        const candidate = resolve(base, raw);
        if (existsSync(candidate)) return candidate;
    }
    return fallback;
}

const DB_FILE_NAME = resolveDbPath();
// Write the resolved absolute path back so anything still reading the raw env
// var directly sees the corrected value.
process.env.DB_FILE_NAME = DB_FILE_NAME;

export const env = {
    OPENAI_API_KEY: openaiKey,
    DB_FILE_NAME,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    PIPEDREAM_CLIENT_ID: process.env.PIPEDREAM_CLIENT_ID,
    PIPEDREAM_CLIENT_SECRET: process.env.PIPEDREAM_CLIENT_SECRET,
    PIPEDREAM_PROJECT_ID: process.env.PIPEDREAM_PROJECT_ID,
    PIPEDREAM_ENVIRONMENT: process.env.PIPEDREAM_ENVIRONMENT,
    PIPEDREAM_USER_ID: process.env.PIPEDREAM_USER_ID,
} as const;

// Every model id Atlas uses, in one place, so swapping a model is a one-line
// change instead of a grep across the codebase.
export const models = {
    atlas: "gpt-5.5",
    planner: "gpt-5.6-luna",
    optimizer: "gpt-5.6-luna",
    title: "gpt-5.4-nano",
    reflection: "gpt-5.4-mini",
    subagent: "gpt-5.4",
    embedding: "text-embedding-3-small",
} as const;
