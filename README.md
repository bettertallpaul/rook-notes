# Rook Notes

A fast, minimal, markdown-based note-taking application built as a local-first playground for exploring modern developer workflows, AI-assisted tooling, and agentic integration frameworks.

## Core Vision & Features

Rook Notes serves as a clean development environment designed for architectural exploration, combining a highly focused, minimalist user interface with powerful background primitives:

- **Minimalist Interface:** Focus-driven markdown editor powered by TipTap.
- **Docker-First Runtime:** Eliminates dependency drift by scoping Node environments and toolchains entirely within isolated containers.
- **Model Context Protocol (MCP):** Exposes core application logic to agentic clients (like Claude Code).
- **Real-Time Synchronization:** Bi-directional updates using Server-Sent Events (SSE) for instant refresh across connected browser tabs and API updates.
- **Opt-In Intelligence:** Tag suggestions using the Google Gemini API, keeping AI features strictly additive to control token spend.
- **Stateless Validation:** Relies on Zod as the singular source of truth across frontend, backend API, and agent schema layers.
- **Interactive API Documentation:** Full suite of testing and development capabilities through an embedded Scalar UI.
- **Pure Local Container Delivery:** Standardizes co-equal, single-stage production Docker containers using version-controlled, parameterized Knative configurations to deploy zero-downtime, subsecond cold-start services directly to Google Cloud Run via CLI.


## Quick Start

### Prerequisites

- Docker and Docker Compose
- GNU Make
- A Google Generative AI API Key (optional, required for AI taxonomy features)

### Setup and Launch

1. **Configure Environment**
   Create a `.env` file in the project root with the following keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   TAXONOMY_MODEL=gemini-2.5-flash-lite
   ```

2. **Boot the Stack**
   Use the built-in bootstrap command to purge existing data, construct services, install dependencies, and seed sample content.
   ```bash
   make fresh
   ```

3. **Access Services**
   - **App Frontend:** http://localhost:5173
   - **API Docs (Scalar):** http://localhost:3001/docs
   - **MCP Server:** http://localhost:3002/mcp

## Agentic Integration (MCP)

Rook Notes hosts a fully operational Model Context Protocol (MCP) server, enabling agents like Claude to inspect, generate, and manage notes directly on your behalf.

### Setup for Local Assistant Access

Follow these instructions to grant your local AI assistant access to Rook Notes.

#### Claude Code Integration
Update your configuration (`~/.claude/settings.json` or `.claude/settings.local.json`):

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

#### Antigravity Integration
Manage MCP server connections through Antigravity settings:

```json
{
  "mcpServers": {
    "rook-notes": {
      "serverUrl": "http://localhost:3002/mcp",
      "disabled": true
    }
  }
}
```

### Available Agent Capabilities
Once connected, the assistant automatically inherits intent-based capabilities including keyword searching, full lifecycle CRUD management of notes, and automatic label reconciliation.

## Developer Workflow

The workspace manages daily tasks through a unified Makefile interface.

| Command | Function |
| :--- | :--- |
| `make up` | Bring all services online (detached mode). |
| `make dev` | Run stack in foreground with combined log visibility. |
| `make shell` | Drop into an interactive shell inside the primary `app` container. |
| `make install` | Execute `pnpm install` within the active container. |
| `make build` | Generate production builds within the active container. |
| `make test` | Execute local tests, including LLM prompt evaluation frameworks. |
| `make down` | Halt all operational containers gracefully. |
| `make purge` | Deep clean environment (removes images, volumes, and `node_modules`). |
| `make seed` | Repopulate standard test data via seed script. |
| `make fresh` | Composite command to wipe, rebuild, and re-seed (`purge` -> `up` -> `seed`). |
| `make prod-verify` | Verify production Docker containers locally by building, running, and testing connectivity. |
| `make prod-release-all` | Chain production releases: builds, pushes to Artifact Registry, and deploys to Cloud Run. |
| `make prod-urls` | Query Google Cloud Run dynamically and print the active public production URLs. |


## Associated Documentation

Refer to the following deep-dive documentation tracks for specialized maintenance or implementation work:

- **[ARCHITECTURE.md](ARCHITECTURE.md):** Deep-level system mappings, data flow, schema contracts, and infrastructure layout optimized for technical ingestion.
- **[DESIGN.md](DESIGN.md):** Style guidelines, color palettes, typography scales, and UI component philosophy.
- **[DEPLOYMENT.md](DEPLOYMENT.md):** Production deployment architecture, local verification workflows, and declarative Google Cloud Run release processes.
- **[BACKLOG.md](BACKLOG.md):** Active project task list organizing near-term implementations, future enhancements, and historically completed features.
- **[Plans Directory](plans/):** Archive of historical audit trails and early product requirement documents. *Note: This directory is no longer actively maintained as active design specifications have moved to [OpenSpec](openspec/), but it remains a valuable reference for future AI milestones (e.g., semantic RAG and intelligent deduplication).*