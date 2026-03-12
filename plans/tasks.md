# MCP Server Integration Tasks

## Phase 1 — Backend foundation

- [x] 1. JSON-file note store (`src/server/store.ts`) — disk-backed CRUD using the existing `Note` type
- [x] 2. HTTP API (`src/server/api.ts`) — Express routes for notes CRUD + labels
- [x] 3. Wire React app to API — replaced localStorage persistence with fetch calls (optimistic updates)
- [x] 4. Update Docker config — added `api` service, `notes_data` volume, Vite proxy to API

## Phase 2 — MCP server

- [x] 5. MCP server (`src/server/mcp.ts`) — 7 tools over Streamable HTTP transport (stateless)
- [x] 6. Expose MCP port 3002 in `docker-compose.yml` as `mcp` service
- [x] 7. Provide Claude Code MCP client config snippet (see below)

## Phase 3 — Refactor: shared schemas, intent-based MCP, API docs

- [x] 8. Shared Zod schemas (`src/shared/schemas.ts`) — single source of truth for the `Note` data model; API and MCP derive types and validation from it
- [x] 9. Add Zod validation to API (`src/server/api.ts`) — use shared schemas for request validation; generate OpenAPI spec via `zod-to-openapi`
- [x] 10. Serve Scalar API docs — mount Scalar UI on the API server at `/docs`; OpenAPI JSON at `/openapi.json`
- [x] 11. Redesign MCP tools — replace 7 fine-grained tools with 4 intent-based tools; MCP calls HTTP API instead of importing `store.ts` directly

### Intent-based MCP tools

| Tool | Description | API calls involved |
|------|-------------|--------------------|
| `search_notes` | Search or list notes | `GET /api/notes?q=` |
| `create_note` | Create a note with title, content, and labels in one shot | `POST /api/notes` + `POST /api/notes/:id/labels` |
| `edit_note` | Update title, content, and/or labels atomically (reconciles label diff) | `GET /api/notes/:id` + `PATCH /api/notes/:id` + label calls |
| `delete_note` | Delete a note by id | `DELETE /api/notes/:id` |

### Design principles

- MCP tools model **user intent**, not API endpoints
- MCP tool input schemas are derived from shared Zod schemas — adding a model field requires updating `schemas.ts` and `store.ts` only
- MCP handlers pass fields through generically, not by explicit field name enumeration

### Claude Code MCP config

Add to `~/.claude/settings.json` or project `.claude/settings.local.json`:

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
