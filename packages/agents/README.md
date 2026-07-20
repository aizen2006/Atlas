# @repo/agents

The agents, tools, and third-party integrations that make up Atlas's reasoning layer. Built on [`@openai/agents`](https://github.com/openai/openai-agents-js). Consumed by [`apps/server`](../../apps/server), which orchestrates these agents into the request pipeline.

## Agents

| Agent | File | Model | Role |
| -------------- | ---------------------------------- | -------------- | --------------------------------------------------- |
| **Atlas** | `src/agents/main.agent.ts` | `gpt-5.5` | The executive assistant. Holds the full toolbelt and produces the user-facing answer. |
| **Planner** | `src/agents/planner.agent.ts` | `gpt-5.6-luna` | Decides — as structured output — whether a plan, memory, or skills are needed before Atlas runs. Has the `getSkills` tool. |
| **Reflection** | `src/agents/reflection.agent.ts` | `gpt-5.4-mini` | Runs after a task (in the background) to distill an experience into a memory. Returns `{ text }`. *(Instructions are currently a stub.)* |

## Tools

| Tool | File | Description |
| ------------------ | ------------------------------- | ------------------------------------------------------------------- |
| `webSearch` | `src/tools/webSearch.tools.ts` | Quick web search via Firecrawl. |
| `webScrape` | `src/tools/webSearch.tools.ts` | Fetch and extract a single page's contents. |
| `agenticSearch` | `src/tools/webSearch.tools.ts` | Deep, multi-step research and synthesis. |
| `listToolsMCP` | `src/tools/pipedream.tools.ts` | Discover an app's available MCP actions before acting. |
| `getSkills` | `src/tools/skills.tools.ts` | List enabled skills from the `skills` table (used by the Planner). |
| `createSubAgents` | `src/tools/subagents.tools.ts` | Delegate to a sandboxed sub-agent (`general` or `researcher`). |

Atlas is additionally wired to two [Pipedream](https://pipedream.com) **hosted MCP** servers for **Gmail** and **Google Calendar**, configured inline in `main.agent.ts`.

### Sub-agents

`createSubAgents` follows a fixed-roster pattern: the caller picks a `subagent_type` and writes a self-contained `prompt` — it never invents a persona per call. Each sub-agent runs in its own sandboxed workspace (`SandboxAgent` + `UnixLocalSandboxClient`) with no memory of the calling conversation, and only its final output is returned.

- **`general`** — broad multi-step work; capabilities: shell, filesystem, memory, compaction; web tools.
- **`researcher`** — read-only web research; no shell or filesystem access.

Sub-agents currently run **synchronously** — the tool call blocks until the sub-agent finishes.

## Utils

- `src/utils/runner.ts` — `runAgent` / `runAgentStream`, thin wrappers over the `@openai/agents` `Runner`.
- `src/utils/firecrawl.ts` — the Firecrawl client (throws on startup if `FIRECRAWL_API_KEY` is missing).
- `src/utils/pipedream.ts` — the Pipedream client plus `tokens()` and `appConnectUrl()` account connect-link helpers.

## Exports

`src/index.ts` re-exports `Atlas`, `planner_agent`, `reflection_agent`, `runAgent`, and `runAgentStream`.

## Environment

Reads `OPENAI_API_KEY` (via the `@openai/agents` SDK), `FIRECRAWL_API_KEY`, and the `PIPEDREAM_*` variables. When Atlas runs inside the server, these must be present in the **server process's** environment. See the [root README](../../README.md#2-configure-environment).
