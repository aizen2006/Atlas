import { defineConfig } from "drizzle-kit";

if(!process.env.DB_FILE_NAME) throw new Error("Failed to load the DB env in drizzle-config")

export default defineConfig({
    schema: "./src/schema.ts",
    out: "./src/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.DB_FILE_NAME
    }
});