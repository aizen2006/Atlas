# @repo/memory

Atlas's persistence layer: a [Drizzle ORM](https://orm.drizzle.team) schema over local **SQLite** (via `bun:sqlite`), with [`sqlite-vec`](https://github.com/asg017/sqlite-vec) loaded for semantic search. Everything Atlas knows — conversations, experiences, and memories — lives here, on disk.

## What it exports

`src/index.ts` opens the SQLite connection, loads the `sqlite-vec` extension, sets `WAL` + foreign-key PRAGMAs, ensures the `vec_memories` virtual table exists, and exports:

- **`db`** — the Drizzle client, bound to `bun:sqlite`.
- **the schema** — all tables re-exported from `src/schema.ts`.

## Tables

| Table | Holds |
| -------------- | -------------------------------------------------------------------------- |
| `sessions` | Conversation threads (title, timestamps). |
| `messages` | Every user/agent turn, linked to a session. |
| `experiences` | A whole solved task: task, result, reflection, success flag, confidence. |
| `memories` | Small reusable facts distilled from experiences, categorized and scored. |
| `skills` | An index of available `SKILL.md` playbooks (name, description, path, stats). |
| `jobs` | Background work (e.g. the reflection pipeline), with status and retries. |

## Vector search

Semantic search uses a `vec0` **virtual table**, `vec_memories`, created at startup in `src/index.ts`. It shadows the `memories` table by id and stores one 1536-dimension embedding (`text-embedding-3-small`) per row:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories USING vec0(
    memory_id INTEGER PRIMARY KEY,
    embedding FLOAT[1536]
);
```

Because `sqlite-vec` virtual tables are invisible to Drizzle, they're written and queried with raw SQL. The read/write helpers (`createMemory`, `searchMemory`, `deleteMemory`) live in [`apps/server/src/libs/utils.ts`](../../apps/server/src/libs/utils.ts) — a memory insert always writes both `memories` and `vec_memories`, and a delete removes from both.

## Migrations

Managed by [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) (config in `drizzle.config.ts`), output to `src/migrations/`.

```bash
bunx drizzle-kit generate    # after editing src/schema.ts
bunx drizzle-kit migrate     # apply pending migrations
```

## Environment

| Variable | Purpose |
| --------------- | -------------------------------------------------- |
| `DB_FILE_NAME` | Path to the SQLite database, e.g. `./src/memory.db`. |

Set it in `packages/memory/.env` (Drizzle Kit reads it; the connection is opened from the same value).
