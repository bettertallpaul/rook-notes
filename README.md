# Rook Notes

> A fast, minimal, markdown-based note-taking app — built as a playground for exploring AI-assisted development and tooling, including  MCP server, AI integration and evals.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Zustand, TipTap (markdown editor), Tailwind CSS 4, Vite, Sonner |
| Backend API | Express 5, Zod validation, OpenAPI via `zod-to-openapi`, Scalar docs UI |
| MCP Server | `@modelcontextprotocol/sdk`, Streamable HTTP transport, stateless |
| AI | Vercel AI SDK, Google Gemini |
| Evaluation | Promptfoo (LLM evals) |
| Data | JSON file store on disk (`data/notes.json`), Docker named volume |
| Schemas | Zod (single source of truth in `src/shared/schemas.ts`) |
| Runtime | Docker Compose (3 services), Node 22 (Bookworm) |

## Architecture

```
                                              data/notes.json
                                                   ▲
┌─────────────┐   SSE + fetch   ┌─────────────┐    │ JSON
│  React App  │◄───────────────►│ Express API │────┘
│   :5173     │                 │   :3001     │
└─────────────┘                 └──────▲──────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │ HTTP                                │ HTTP
             ┌──────▼──────┐                       ┌──────▼──────┐
             │ MCP Server  │                       │ AI Service  │
             │  :3002/mcp  │                       │  (Gemini)   │
             └─────────────┘                       └─────────────┘
```

- **MCP is a consumer of the HTTP API** — it does not import `store.ts` directly. This means extending the data model only requires changes in `schemas.ts` + `store.ts`.
- **SSE** (`/api/events`) pushes `data: changed` to all connected browsers after every mutation. The React app re-fetches the note list on each event.
- **Vite** proxies `/api/*` to the `api` service and disables buffering for SSE.

## Key Files

| File | Purpose |
|------|---------|
| `src/shared/schemas.ts` | Zod schemas: `NoteSchema`, `CreateNoteSchema`, `UpdateNoteSchema`, `AddLabelSchema`. All types derived here. |
| `src/types/note.ts` | Re-exports `Note` from schemas; defines UI-only types (`SortMode`, `LifecycleFilter`) |
| `src/server/store.ts` | JSON-file CRUD store for notes |
| `src/server/api.ts` | Express API: REST routes, OpenAPI spec, SSE broadcast, Scalar docs at `/docs` |
| `src/server/mcp.ts` | MCP server: 4 intent-based tools (`search_notes`, `create_note`, `edit_note`, `delete_note`) |
| `src/server/ai/taxonomy.ts` | AI taxonomy service (Vercel AI SDK) |
| `src/server/events/listeners.ts` | Event listeners for side-effects |
| `tests/promptfoo/` | LLM evaluation suite (benchmarks & prompts) |
| `src/store/useNoteStore.ts` | Zustand store: client-side state, optimistic updates, API calls |
| `src/App.tsx` | Root component: SSE subscription, initial fetch |
| `src/components/layout/Sidebar.tsx` | Tag filters, lifecycle filters |
| `src/components/layout/MainPanel.tsx` | Note list + editor layout |
| `src/components/notes/NoteList.tsx` | Note list, sort controls, and search bar layout |
| `src/components/notes/NoteEditor.tsx` | TipTap markdown editor |
| `src/components/notes/LabelEditor.tsx` | Tag/Label editor with opt-in AI suggestion row |
| `src/components/notes/SortControl.tsx` | Sorting dropdown control |
| `src/components/search/SearchBar.tsx` | Live keyword search input |
| `docker-compose.yml` | 3 services: `app` (Vite), `api` (Express), `mcp` |
| `Dockerfile.dev` | `node:22-bookworm-slim`, npm install, dev server |
| `Makefile` | Task runner (see commands below) |
| `scripts/seed.sh` | Creates 6 sample notes via API |

## Docker Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| `app` | `npm run dev` (Vite) | 5173 | Proxies `/api` to `api:3001` |
| `api` | `npm run api` (tsx watch) | 3001 | REST API + SSE + Scalar docs |
| `mcp` | `npm run mcp` (tsx watch) | 3002 | `API_BASE_URL=http://api:3001` |

Shared volumes: `node_modules` (named), `notes_data` (named, mounted at `/app/data`), source bind-mount.

## Makefile Commands

| Command | What it does |
|---------|-------------|
| `make up` | Build and start all services (detached) |
| `make dev` | Start all services (foreground, with logs) |
| `make down` | Stop all services |
| `make shell` | Open bash in the `app` container |
| `make install` | Run `npm install` inside container |
| `make build` | Run `npm run build` inside container |
| `make test` | Run `npm test` inside container |
| `make seed` | Populate sample notes via API |
| `make fresh` | Purge everything, rebuild, wait for API, then seed |
| `make purge` | Tear down containers, volumes, and local images |

## AI Configuration

The AI features (currently limited to tag suggestions) are configured via environment variables in `.env`.

- `GOOGLE_GENERATIVE_AI_API_KEY` : Your Google AI API Key.
- `TAXONOMY_MODEL` : The model identifier (e.g., `gemini-2.5-flash-lite` or `gemini-2.5-pro`).

To apply changes to `.env` (like switching models), you must restart the containers to pick up the new environment variables:

```bash
make down && make up
```

## MCP Tools (intent-based)

| Tool | Description |
|------|-------------|
| `search_notes` | Search by keyword or list all notes |
| `create_note` | Create note with title, content, and labels in one shot |
| `edit_note` | Update title/content and reconcile labels to a desired final set (supports object-based schema) |
| `delete_note` | Delete a note by ID |

MCP config for Claude Code (`~/.claude/settings.json` or `.claude/settings.local.json`):
```json
{
  "mcpServers": {
    "rook-notes": {
      "type": "streamable-http",
      "url": "http://localhost:3002/mcp"
    }
  }
}
```

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/notes` | List notes (optional `?q=` for search) |
| `GET` | `/api/notes/:id` | Get single note |
| `POST` | `/api/notes` | Create note |
| `PATCH` | `/api/notes/:id` | Update note |
| `DELETE` | `/api/notes/:id` | Delete note |
| `POST` | `/api/notes/:id/labels` | Add label |
| `DELETE` | `/api/notes/:id/labels/:label` | Remove label |
| `POST` | `/api/notes/:id/suggest-tags` | Get AI-suggested tags for a note |
| `GET` | `/api/events` | SSE stream (real-time updates) |
| `GET` | `/openapi.json` | OpenAPI spec |
| `GET` | `/docs` | Scalar API docs UI |

## Design Decisions

- **No `node_modules` on host** — lives in a Docker named volume. IDE may show import errors; code runs correctly in containers.
- **Optimistic updates** — Zustand store updates immediately, then fires API call. SSE ensures consistency across clients.
- **Single source of truth** — Zod schemas in `src/shared/schemas.ts`. To add a field to the Note model: update `schemas.ts`, then `store.ts`. API and MCP pick it up automatically.
- **Stateless MCP** — each request creates a fresh `McpServer` instance. No session management needed.
- **`tsx watch`** — API and MCP servers auto-reload on file changes. Occasionally may need `docker compose restart api` or `docker compose restart mcp` if changes aren't picked up.
- **Opt-In Intelligence** — AI features (currently limited to _Suggest Tags_) are explicitly triggered by the user to preserve agency and manage API quotas.
- **Bubbled Error Handling** — Backend and AI errors are bubbled up as raw messages to the UI. This ensures actionable feedback (e.g., API timeouts, quota limits) via global toast notifications (using Sonner) instead of generic "Failed" messages.

## Getting Started

```bash
make fresh   # purge, build, start, seed sample data
```

Then open http://localhost:5173 for the app, http://localhost:3001/docs for API docs.

## Task Tracking
See `/plans/` for PRDs, specs, mocks and tasks.