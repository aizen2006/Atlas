# server

The HTTP entry point and **orchestrator** for Atlas. A [Hono](https://hono.dev) app that receives chat requests and drives the full plan → retrieve → act → reflect pipeline, wiring together [`@repo/agents`](../../packages/agents) and [`@repo/memory`](../../packages/memory).

## Layout

```
src/
├── index.ts            # Hono app: mounts /chat, global error + 404 handlers
├── routes/
│   └── chat.ts         # the request pipeline (see below)
└── libs/
    ├── openai.ts       # OpenAI client for the server's own model calls
    └── utils.ts        # memory + skills helpers used by the pipeline
```

## Endpoints

### `POST /chat`

The main (non-streaming) endpoint. Body: `{ "query": string, "sessionId"?: number }`.

The handler in [`src/routes/chat.ts`](src/routes/chat.ts) runs these steps:

1. **Title & session** — derive a conversation title (`gpt-5.4-nano`); create a new `sessions` row or resume the given `sessionId` and load its prior messages; persist the incoming user message.
2. **Optimize** — rewrite the raw query into a sharper prompt (`gpt-5.6-luna`).
3. **Plan** — run the Planner agent; it returns whether a plan / memory / skills are needed, plus the plan text and any skill names.
4. **Retrieve** — if the planner asked for them: `searchMemory(query, 3)` (semantic search) and `loadSkills(names)` (read `SKILL.md` from disk), injected into the prompt template.
5. **Act** — run the Atlas agent on the assembled prompt; persist its reply.
6. **Respond** — return `{ sessionId, response }`.
7. **Reflect (background)** — `runReflectionPipeline` fires without blocking the response: open a `jobs` row → record an `experiences` row → run the Reflection agent → store the lesson via `createMemory` → mark the job complete (or failed).

### `POST /chat/stream`

Stubbed — reserved for a future streaming implementation.

## `libs/utils.ts`

Helpers the pipeline (and reflection) depend on:

| Function | Purpose |
| ---------------- | -------------------------------------------------------------------------- |
| `embed(text)` | Create an embedding via `text-embedding-3-small`. |
| `createMemory(...)` | Insert a memory row **and** its embedding into the `vec_memories` table. |
| `searchMemory(query, k)` | Embed the query, k-NN search `vec_memories`, hydrate the matching `memories`. |
| `deleteMemory(id)` | Remove a memory from both the `memories` and `vec_memories` tables. |
| `loadSkills(names)` | Read the `SKILL.md` files for the named skills and strip their frontmatter. |

## Environment

The server process needs **both** OpenAI variable names — `OPENAI` (used directly by `libs/openai.ts`) and `OPENAI_API_KEY` (used by `@repo/agents`) — plus the Firecrawl and Pipedream keys the agents rely on. See the [root README](../../README.md#2-configure-environment) for the full table.

## Run

```bash
bun run dev          # bun run --hot src/index.ts  → http://localhost:3000
```

Make sure the database migrations have been applied first (see [`@repo/memory`](../../packages/memory/README.md)).
