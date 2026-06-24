# Atlas

> **Atlas is an AI executive assistant and agentic operating system that automates research, tasks, and business operations.**

Atlas acts like a sharp executive support partner: proactive, organized, and decisive. Today it automates **web research**, **email**, and **calendar** workflows through a single agent. The architecture — a reasoning agent wired to composable tools and [Model Context Protocol](https://modelcontextprotocol.io) (MCP) integrations — is built to grow into broader task and business-operations automation (sub-agents, workflows, reminders, and more).

---

## ✨ Features

- **Web research** — quick search, single-page scraping, and deep multi-step "agentic" research, all powered by [Firecrawl](https://firecrawl.dev).
- **Email** — read, draft, and send via **Gmail**, connected through [Pipedream](https://pipedream.com) hosted MCP.
- **Calendar** — create and manage events via **Google Calendar**, also through Pipedream MCP.
- **Tool discovery** — Atlas can list an app's available MCP actions on the fly before acting.
- **Conversation memory** — sessions backed by OpenAI Conversations, so context persists across turns.
- **Executive-assistant behavior** — concise, high-signal output: summaries, action items, ready-to-send drafts, and recommendations.

## 🧱 Tech stack

| Area            | Technology |
| --------------- | ------------------------------------------------ |
| Runtime         | [Bun](https://bun.sh) |
| Language        | [TypeScript](https://www.typescriptlang.org) |
| Monorepo        | [Turborepo](https://turborepo.dev) |
| Agent framework | [`@openai/agents`](https://github.com/openai/openai-agents-js) |
| Model           | `gpt-5.4-mini` |
| Web research    | [Firecrawl](https://firecrawl.dev) |
| Integrations    | [Pipedream](https://pipedream.com) hosted MCP (Gmail, Google Calendar) |
| Validation      | [Zod](https://zod.dev) |

## 📁 Project structure

Atlas is a Bun + Turborepo monorepo. The agent itself lives in `packages/agents`:

```
Atlas/
├── apps/                       # (reserved for future apps, e.g. a web UI)
├── packages/
│   ├── agents/                 # ⭐ Atlas — the AI assistant
│   │   ├── agent.ts            # Atlas agent: instructions, model, tools, MCP servers
│   │   ├── main.ts             # Entry point — runs a prompt through Atlas
│   │   ├── tools/
│   │   │   ├── webSearchTools.ts   # webSearch, webScrape, agenticSearch (Firecrawl)
│   │   │   └── pipedreamTools.ts   # listToolsMCP — discover an app's MCP actions
│   │   └── utils/
│   │       ├── runner.ts       # agentRunner — wraps Runner.run with a session
│   │       ├── pipedream.ts    # Pipedream client + account connect-link helpers
│   │       ├── firecrawl.ts    # Firecrawl client
│   │       └── sessions.ts     # OpenAI Conversations session (memory)
│   ├── ui/                     # Shared React component library (Turborepo scaffold)
│   ├── eslint-config/          # Shared ESLint config
│   └── typescript-config/      # Shared tsconfig presets
├── turbo.json
└── package.json
```

## ✅ Prerequisites

- [Bun](https://bun.sh) `>= 1.3`
- [Node.js](https://nodejs.org) `>= 18`
- API keys / accounts for:
  - [OpenAI](https://platform.openai.com) — agent model & conversation sessions
  - [Firecrawl](https://firecrawl.dev) — web research tools
  - [Pipedream](https://pipedream.com) — Gmail & Calendar integrations (a connected project with Gmail and Google Calendar)

## 🚀 Getting started

```bash
# 1. Clone the repo
git clone <your-repo-url> Atlas
cd Atlas

# 2. Install dependencies
bun install

# 3. Configure environment variables for the agent
cd packages/agents
cp .env.example .env
# then open .env and fill in your keys (see the table below)
```

## 🔑 Environment variables

Set these in `packages/agents/.env`:

| Variable                  | Required | Description |
| ------------------------- | :------: | ------------------------------------------------------- |
| `OPENAI_API_KEY`          |    ✅    | OpenAI key — powers the agent model and conversation sessions. |
| `FIRECRAWL_API_KEY`       |    ✅    | Firecrawl key — required for the web tools (the app throws on startup if missing). |
| `PIPEDREAM_CLIENT_ID`     |    ✅    | Pipedream OAuth client ID. |
| `PIPEDREAM_CLIENT_SECRET` |    ✅    | Pipedream OAuth client secret. |
| `PIPEDREAM_PROJECT_ID`    |    ✅    | Pipedream project ID. |
| `PIPEDREAM_ENVIRONMENT`   |    ✅    | Pipedream environment (e.g. `development`). |
| `PIPEDREAM_USER_ID`       |    ✅    | External user ID whose connected Gmail/Calendar accounts Atlas acts on. |
| `CONV_ID`                 |    ⬜    | Optional OpenAI conversation ID to resume an existing session. |

> **Note:** the checked-in `.env.example` currently lists only a subset of these. Use the table above as the source of truth, and add `PIPEDREAM_USER_ID` and (optionally) `CONV_ID` when filling out your `.env`.

## ▶️ Running Atlas

The entry point is `packages/agents/main.ts`. It sends a prompt through `agentRunner` and prints the result. Edit the `userPrompt` in `main.ts` to give Atlas a different task, then run:

```bash
# from packages/agents
bun run main.ts
```

```ts
// packages/agents/main.ts
const userPrompt = `Can book a event in calender named meeting with Abhik tomorrow at 9am, Asia/Kolkata`;
const output = await agentRunner(Atlas, userPrompt);
console.log(output);
```

You can also use the Turborepo scripts from the repo root (`bun run dev`, `bun run build`, `bun run lint`, `bun run check-types`).

## 🧠 How it works

1. **`main.ts`** defines a user prompt and calls `agentRunner(Atlas, prompt)`.
2. **`agentRunner`** (`utils/runner.ts`) runs the agent via the OpenAI Agents `Runner`, attaching a persistent **session** (`utils/sessions.ts`) for conversation memory.
3. **`Atlas`** (`agent.ts`) reasons over the prompt with its executive-assistant instructions and decides which tools to call:
   - **Firecrawl tools** (`webSearch`, `webScrape`, `agenticSearch`) for research.
   - **Pipedream hosted MCP servers** for Gmail and Google Calendar actions, with available actions discoverable via `listToolsMCP`.
4. The final, synthesized response is returned and printed.

## 🗺️ Roadmap

- [x] Email management (Gmail)
- [x] Calendar management (Google Calendar)
- [x] Web search & research
- [ ] More app integrations
- [ ] Sub-agents (sandboxed) for delegated work
- [ ] Macros / workflows to automate repetitive tasks (job queue via BullMQ + Redis)
- [ ] Reminders & cron jobs (BullMQ)
