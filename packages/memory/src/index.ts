import { drizzle } from 'drizzle-orm/better-sqlite3';

if(!process.env.DB_FILE_NAME) throw new Error("Failed to load the DB env")

export const db = drizzle(process.env.DB_FILE_NAME);

// const result = await db.all('select 1');

export * from "./schema";