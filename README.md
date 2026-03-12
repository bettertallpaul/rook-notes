# Rook Notes

> A fast, minimal, markdown-based note-taking app — built as a playground for MCP servers and AI-assisted development.

## What is Rook?

A fast, minimal, markdown-based note-taking app. See [rook-prd.md](rook-prd.md) for the full product vision. Current state is a working prototype with a React frontend, Express API, and MCP server — all running in Docker.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Zustand, TipTap (markdown editor), Tailwind CSS 4, Vite |
| Backend API | Express 5, Zod validation, OpenAPI via `zod-to-openapi`, Scalar docs UI |
| MCP Server | `@modelcontextprotocol/sdk`, Streamable HTTP transport, stateless |
| Data | JSON file store on disk (`data/notes.json`), Docker named volume |
| Schemas | Zod (single source of truth in `src/shared/schemas.ts`) |
| Runtime | Docker Compose (3 services), Node 22 |

## Architecture

```
                                              data/notes.json
                                                   ▲
┌─────────────┐   SSE + fetch   ┌─────────────┐    │ JSON
│  React App  │◄───────────────►│ Express API │────┘
│   :5173     │                 │   :3001     │
└─────────────┘                 └──────▲──────┘
                                       │ HTTP
                                ┌──────┴──────┐
                                │ MCP Server  │
                                │  :3002/mcp  │
                                └─────────────┘
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
| `src/store/useNoteStore.ts` | Zustand store: client-side state, optimistic updates, API calls |
| `src/App.tsx` | Root component: SSE subscription, initial fetch |
| `src/components/layout/Sidebar.tsx` | Label filters, lifecycle filters, sort controls |
| `src/components/layout/MainPanel.tsx` | Note list + editor layout |
| `src/components/notes/NoteEditor.tsx` | TipTap markdown editor |
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

## MCP Tools (intent-based)

| Tool | Description |
|------|-------------|
| `search_notes` | Search by keyword or list all notes |
| `create_note` | Create note with title, content, and labels in one shot |
| `edit_note` | Update title/content and reconcile labels to a desired final set |
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
| `GET` | `/api/events` | SSE stream (real-time updates) |
| `GET` | `/openapi.json` | OpenAPI spec |
| `GET` | `/docs` | Scalar API docs UI |

## Design Decisions

- **No `node_modules` on host** — lives in a Docker named volume. IDE may show import errors; code runs correctly in containers.
- **Optimistic updates** — Zustand store updates immediately, then fires API call. SSE ensures consistency across clients.
- **Single source of truth** — Zod schemas in `src/shared/schemas.ts`. To add a field to the Note model: update `schemas.ts`, then `store.ts`. API and MCP pick it up automatically.
- **Stateless MCP** — each request creates a fresh `McpServer` instance. No session management needed.
- **`tsx watch`** — API and MCP servers auto-reload on file changes. Occasionally may need `docker compose restart api` or `docker compose restart mcp` if changes aren't picked up.

## Getting Started

```bash
make fresh   # purge, build, start, seed sample data
```

Then open http://localhost:5173 for the app, http://localhost:3001/docs for API docs.

## Task Tracking

See [tasks.md](plans/tasks.md) for completed phases and current status.
