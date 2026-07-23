import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as sqliteVec from 'sqlite-vec';
import { existsSync } from 'node:fs';
import { env } from '@repo/config';

// env.DB_FILE_NAME is always an absolute path resolved by @repo/config, so the
// cwd a process was launched from can no longer decide which database opens.
// Log it (and whether it already existed) so a misconfigured path is loud
// instead of silently creating a fresh, empty database.
const dbExisted = existsSync(env.DB_FILE_NAME);
console.log(`DB: ${env.DB_FILE_NAME} (${dbExisted ? "existing" : "new — will be created"})`);

const sqlite = new Database(env.DB_FILE_NAME);
sqlite.loadExtension(sqliteVec.getLoadablePath());

sqlite.run(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
`);

// shadow index for the memories table; memory_id mirrors memories.id
sqlite.run(`
CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories USING vec0(
    memory_id INTEGER PRIMARY KEY,
    embedding FLOAT[1536]
);
`);

export const db = drizzle(sqlite);


export * from "./schema";