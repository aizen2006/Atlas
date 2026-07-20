# Atlas

**An agentic executive assistant that plans before it acts, remembers what it learns, and reflects after every task.**

Most assistants are a single model call wrapped in a prompt. Atlas is a small society of agents with a memory. A request doesn't just hit a model — it flows through a cognitive loop: a **planner** decides what's needed, relevant **memories** and **skills** are retrieved, the **Atlas** agent acts with a full toolbelt, and afterwards a **reflection** pass distills the outcome into a durable memory for next time.

The result is an assistant that gets sharper the more you use it, backed entirely by a local SQLite database — conversations, experiences, and semantically-searchable memories all live on your own disk.

---

## The shape of a request

Everything routes through one endpoint — `POST /chat` — and the interesting part is what happens between the request and the response. This pipeline lives in [`apps/server/src/routes/chat.ts`](apps/server/src/routes/chat.ts):

```
   POST /chat  { query, sessionId? }
        │
        ▼
  ①  Title & session        derive a title (gpt-5.4-nano), create or resume a
                            session, load prior messages, persist the user turn
        │
        ▼
  ②  Optimize the query     a query-optimizer pass (gpt-5.6-luna) rewrites the
                            raw request into a sharp, unambiguous prompt
        │
        ▼
  ③  Plan                   the Planner agent decides which resources this task
                            needs — a plan? memory? skills? — and returns them
        │
        ▼
  ④  Retrieve               • memory  → semantic search over past memories (sqlite-vec)
                            • skills  → load matching SKILL.md instructions from disk
                            each is injected into the prompt only if the planner asked
        │
        ▼
  ⑤  Act                    the Atlas agent (gpt-5.5) runs the assembled prompt
                            with web, email, calendar, MCP-discovery, and
                            sub-agent tools; its reply is persisted and returned
        │
        ▼   (returns to the caller here — the rest runs in the background)
        │
  ⑥  Reflect & remember     a fire-and-forget pipeline: open a job → record an
                            experience → the Reflection agent distills a lesson →
                            store it as an embedded memory → close the job
```

Steps ③–④ mean Atlas only pays for planning, retrieval, and skill-loading when the task actually warrants it. Step ⑥ is why Atlas improves over time — every interaction can leave behind a memory that future requests can retrieve.

---

## What Atlas can do today

- **Web research** — quick search, single-page scraping, and deep multi-step "agentic" research, all via [Firecrawl](https://firecrawl.dev).
- **Email** — read, draft, and send through **Gmail**, connected as a hosted [MCP](https://modelcontextprotocol.io) server via [Pipedream](https://pipedream.com).
- **Calendar** — create and manage **Google Calendar** events, also through Pipedream MCP.
- **Tool discovery** — Atlas can enumerate an app's available MCP actions on the fly before acting.
- **Sub-agents** — delegate complex or long-running work to a sandboxed sub-agent (`general` or `researcher`), each running in its own isolated workspace.
- **Persistent memory** — sessions, messages, experiences, and semantically-searchable memories, all in local SQLite.
- **Skills** — reusable `SKILL.md` playbooks the planner can pull in for specialized tasks (e.g. writing email).

---

## Architecture

Atlas is a [Bun](https://bun.sh) + [Turborepo](https://turborepo.dev) monorepo. Three pieces do the real work:

```
Atlas/
├── apps/
│   └── server/                    # 🌐 Hono HTTP server — the entry point & orchestrator
│       └── src/
│           ├── index.ts           # Hono app, routes, error handling
│           ├── routes/chat.ts     # the request pipeline (plan → retrieve → act → reflect)
│           └── libs/
│               ├── openai.ts      # OpenAI client for the server's own model calls
│               └── utils.ts       # embed, createMemory, searchMemory, deleteMemory, loadSkills
│
├── packages/
│   ├── agents/                    # 🤖 @repo/agents — the agents, tools & integrations
│   │   └── src/
│   │       ├── agents/
│   │       │   ├── main.agent.ts        # Atlas — the executive assistant (gpt-5.5)
│   │       │   ├── planner.agent.ts     # Planner — decides plan/memory/skills (gpt-5.6-luna)
│   │       │   └── reflection.agent.ts  # Reflection — distills experiences into memories
│   │       ├── tools/
│   │       │   ├── webSearch.tools.ts   # webSearch, webScrape, agenticSearch (Firecrawl)
│   │       │   ├── pipedream.tools.ts   # listToolsMCP — discover an app's MCP actions
│   │       │   ├── skills.tools.ts      # getSkills — list available skills from the DB
│   │       │   └── subagents.tools.ts   # createSubAgents — spawn sandboxed sub-agents
│   │       ├── utils/
│   │       │   ├── runner.ts            # runAgent / runAgentStream (Runner wrappers)
│   │       │   ├── pipedream.ts         # Pipedream client + account connect-link helpers
│   │       │   └── firecrawl.ts         # Firecrawl client
│   │       └── index.ts                 # package exports
│   │
│   ├── memory/                    # 🧠 @repo/memory — SQLite + vector persistence (Drizzle)
│   │   └── src/
│   │       ├── schema.ts          # sessions, messages, experiences, skills, memories, jobs
│   │       ├── index.ts           # bun:sqlite + sqlite-vec, PRAGMAs, vec_memories table
│   │       └── migrations/        # Drizzle Kit migrations
│   │
│   ├── skills/                    # 📚 SKILL.md playbooks (e.g. writing-email)
│   ├── ui/                        # shared React components (Turborepo scaffold, unused by Atlas)
│   ├── eslint-config/             # shared ESLint config
│   └── typescript-config/         # shared tsconfig presets
│
├── turbo.json
└── package.json
```

### The agents

| Agent | Model | Role |
| ---------- | -------------- | ------------------------------------------------------------ |
| **Atlas** | `gpt-5.5` | The executive assistant. Holds the full toolbelt (web, Gmail/Calendar MCP, sub-agents) and produces the user-facing answer. |
| **Planner** | `gpt-5.6-luna` | Runs before Atlas. Returns a structured decision: is a plan / memory / skills needed, plus the plan text and skill list. |
| **Reflection** | `gpt-5.4-mini` | Runs after Atlas, in the background. Distills the task + result into a lesson that becomes a stored memory. |

The server also makes two direct model calls of its own: a **title** generator (`gpt-5.4-nano`) and a **query optimizer** (`gpt-5.6-luna`). Sub-agents run on `gpt-5.4`. Model IDs are set per-agent in their source files and are trivial to swap.

### The memory model

`@repo/memory` is a [Drizzle ORM](https://orm.drizzle.team) schema over SQLite (via `bun:sqlite`), with [`sqlite-vec`](https://github.com/asg017/sqlite-vec) loaded for vector search:

| Table | Holds |
| -------------- | -------------------------------------------------------------------------- |
| `sessions` | Conversation threads (title, timestamps). |
| `messages` | Every user/agent turn, linked to a session. |
| `experiences` | A whole solved task: the task, its result, the reflection, success flag. |
| `memories` | Small reusable facts distilled from experiences, categorized and scored. |
| `skills` | An index of available `SKILL.md` playbooks (name, description, path, stats). |
| `jobs` | Background work (e.g. the reflection pipeline), with status and retries. |

Semantic search lives in a companion **virtual table**, `vec_memories`, created at startup in [`packages/memory/src/index.ts`](packages/memory/src/index.ts). It shadows the `memories` table by id and stores a 1536-dimension embedding (`text-embedding-3-small`) per memory. `searchMemory()` embeds the query, runs a k-nearest-neighbour `MATCH` against `vec_memories`, then hydrates the full rows from `memories` — see [`apps/server/src/libs/utils.ts`](apps/server/src/libs/utils.ts).

---

## Tech stack

| Area | Technology |
| --------------- | ------------------------------------------------------------------ |
| Runtime | [Bun](https://bun.sh) `>= 1.3` |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Monorepo | [Turborepo](https://turborepo.dev) |
| HTTP server | [Hono](https://hono.dev) |
| Agent framework | [`@openai/agents`](https://github.com/openai/openai-agents-js) (incl. sandboxed sub-agents) |
| Persistence | [SQLite](https://sqlite.org) (`bun:sqlite`) + [Drizzle ORM](https://orm.drizzle.team) |
| Vector search | [`sqlite-vec`](https://github.com/asg017/sqlite-vec) |
| Web research | [Firecrawl](https://firecrawl.dev) |
| Integrations | [Pipedream](https://pipedream.com) hosted MCP (Gmail, Google Calendar) |
| Validation | [Zod](https://zod.dev) |

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.3`
- [Node.js](https://nodejs.org) `>= 18`
- Accounts / API keys for [OpenAI](https://platform.openai.com), [Firecrawl](https://firecrawl.dev), and [Pipedream](https://pipedream.com) (a project with Gmail and Google Calendar connected).

### 1. Install

```bash
git clone <your-repo-url> Atlas
cd Atlas
bun install
```

### 2. Configure environment

Atlas reads env vars from a few `.env` files. The most important gotcha: **the server reads `OPENAI`, while the agents package reads `OPENAI_API_KEY`** — for a single-process run, set both to the same key.

**`apps/server/.env`** (loaded by the server process):

```bash
OPENAI='sk-...'                    # server-side calls: title, query optimizer, embeddings
OPENAI_API_KEY='sk-...'            # same key — consumed by the agents (Atlas/planner/reflection)
FIRECRAWL_API_KEY='fc-...'
PIPEDREAM_CLIENT_ID='...'
PIPEDREAM_CLIENT_SECRET='...'
PIPEDREAM_PROJECT_ID='...'
PIPEDREAM_ENVIRONMENT='development'
PIPEDREAM_USER_ID='...'            # external user whose Gmail/Calendar Atlas acts on
```

**`packages/memory/.env`** (loaded by Drizzle Kit and the memory package):

```bash
DB_FILE_NAME='./src/memory.db'
```

| Variable | Read by | Purpose |
| ------------------------- | ---------------------------- | ------------------------------------------------------ |
| `OPENAI` | `apps/server` | Server's own model calls (title, query optimizer, embeddings). |
| `OPENAI_API_KEY` | `@repo/agents` | Powers the Atlas / planner / reflection / sub-agents. |
| `FIRECRAWL_API_KEY` | `@repo/agents` | Web search / scrape / agentic research. Throws on startup if missing. |
| `PIPEDREAM_CLIENT_ID` | `@repo/agents` | Pipedream OAuth client ID. |
| `PIPEDREAM_CLIENT_SECRET` | `@repo/agents` | Pipedream OAuth client secret. |
| `PIPEDREAM_PROJECT_ID` | `@repo/agents` | Pipedream project ID. |
| `PIPEDREAM_ENVIRONMENT` | `@repo/agents` | Pipedream environment (e.g. `development`). |
| `PIPEDREAM_USER_ID` | `@repo/agents` | External user ID whose connected accounts Atlas acts on. |
| `DB_FILE_NAME` | `@repo/memory` | SQLite database path (e.g. `./src/memory.db`). |

### 3. Set up the database

From `packages/memory`, apply the migrations to create the SQLite schema:

```bash
cd packages/memory
bunx drizzle-kit migrate          # apply existing migrations
# bunx drizzle-kit generate       # regenerate after editing schema.ts
```

The `vec_memories` virtual table is created automatically when the memory package first loads.

### 4. Run the server

```bash
cd apps/server
bun run dev                       # bun run --hot src/index.ts  → http://localhost:3000
```

Or from the repo root, drive everything through Turborepo:

```bash
bun run dev          # turbo run dev
bun run build
bun run lint
bun run check-types
```

### 5. Talk to Atlas

```bash
curl -X POST http://localhost:3000/chat \
  -H 'Content-Type: application/json' \
  -d '{ "query": "Book a meeting with Abhik tomorrow at 9am Asia/Kolkata" }'
```

The response is `{ "sessionId": <number>, "response": "<Atlas reply>" }`. Pass the returned `sessionId` back on the next request to continue the same conversation.

---

## Project status

Atlas is under active development. The plan → retrieve → act → reflect pipeline is wired end to end, but several pieces are intentionally minimal or stubbed — worth knowing before you dig in:

- **`/chat/stream`** — the streaming endpoint is stubbed; only the non-streaming `POST /chat` is implemented.
- **Reflection agent** — wired into the pipeline, but its instructions string is currently empty and needs authoring.
- **Memory helpers** — the working semantic-search implementation (`createMemory` / `searchMemory` / `deleteMemory`) lives in `apps/server/src/libs/utils.ts`; it is not yet packaged inside `@repo/memory`.
- **Skills** — `loadSkills` and `getSkills` work, but the `skills` table starts empty; a disk-scan sync that upserts `SKILL.md` files into the table is not yet built, so the skills layer stays inert until the table is seeded.
- **Sub-agents** run synchronously (the tool call blocks until the sub-agent finishes).

## Roadmap

- [x] Email management (Gmail)
- [x] Calendar management (Google Calendar)
- [x] Web search & research (Firecrawl)
- [x] Local SQLite memory (sessions, messages, experiences, memories, jobs)
- [x] Semantic memory search (sqlite-vec)
- [x] Planner → retrieve → act → reflect pipeline
- [x] Sandboxed sub-agents
- [ ] Streaming responses
- [ ] Skill auto-sync from disk → `skills` table
- [ ] Background job queue & worker (durable reflection / async work)
- [ ] More app integrations
- [ ] Reminders & scheduled (cron) tasks
