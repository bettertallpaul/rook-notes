## Why

The current **rook-notes** codebase is configured as a single monolithic package where the React SPA frontend, the Express API backend, and the stateless Model Context Protocol (MCP) server are co-located under a single root directory. They share a single `package.json` with over 35 mixed dependencies and a single `tsconfig.json`.

In production, the backend services (`api` and `mcp`) are currently started with `npx tsx src/server/api.ts` and `npx tsx src/server/mcp.ts` on-the-fly inside Google Cloud Run. This requires downloading and running the `tsx` CLI and transpiling the entire TypeScript codebase at container boot-time, causing slow container spin-up (3-5+ seconds cold starts). 

We need to reorganize the repository into native `pnpm workspaces` (the Services Unified Pattern) to enforce strict module boundaries, isolate package dependencies, and pre-compile/bundle all services locally within the development container. This will allow the production Docker containers to execute pre-compiled vanilla JavaScript and static Nginx serving roots, completely eliminating run-time compiler overhead and reducing cold starts to under 1 second.

## What Changes

- **[NEW]** Define workspaces using `pnpm-workspace.yaml` in the root.
- **[NEW]** Scaffold isolated subdirectories for all components:
  - `services/shared/` containing shared Zod schemas and types (`@rook/shared`).
  - `services/frontend/` containing the Vite + React client (`@rook/frontend`).
  - `services/api/` containing the Express API backend (`@rook/api`).
  - `services/mcp/` containing the stateless MCP server (`@rook/mcp`).
- **[NEW]** Setup production Docker files inside each service workspace directory:
  - `services/frontend/Dockerfile` serving compiled static files via Nginx Alpine.
  - `services/api/Dockerfile` running bundled API script natively with Node.
  - `services/mcp/Dockerfile` running bundled MCP script natively with Node.
- **[DELETE]** Remove legacy root Dockerfiles: `Dockerfile.app`, `Dockerfile.api`, `Dockerfile.mcp`.
- **[MODIFY]** Reconfigure the root `package.json` and `tsconfig.json` to act as workspace coordinators.
- **[MODIFY]** Restructure internal imports across services to reference `@rook/shared` instead of relative file paths (e.g. `../../shared/schemas`).
- **[MODIFY]** Update `docker-compose.yml` to orchestrate dev containers using workspace-filtered dev scripts.
- **[MODIFY]** Update `Makefile` to align dev execution, dependency install, and production verification pipelines with the new workspaces structure.
- **[MODIFY]** Update technical guides (`ARCHITECTURE.md` and `DEPLOYMENT.md`) to represent the pre-compiled monorepo design.

## Capabilities

### New Capabilities
- `workspaces-setup`: Reorganization of the single-package repository into native `pnpm workspaces` dividing the codebase into modular, self-contained service packages while maintaining a shared monorepo lockfile.
- `precompiled-bundling`: Configuration to build backend Express API and MCP servers into single-file, self-contained ESM JavaScript modules (`dist/index.js`) and compile the React client into static assets locally.
- `artifact-first-deployment`: Symmetrical, single-stage production container configurations executing compiled ESM modules on raw node and nginx engines without run-time compiler overhead.

### Modified Capabilities

## Impact

- **TypeScript Engine / Runtime**: TypeScript transpilation is completely bypassed at runtime.
- **Image Size**: Production Docker images shrink significantly (~35MB for Node containers, ~25MB for Nginx container).
- **Cold Starts**: Container startup latency drops from ~4-5 seconds down to under 1 second.
- **Dependency Isolation**: Shared, frontend, and backend packages manage their own explicit dependencies, avoiding global namespace leaks.
- **Dev Tooling**: Dev environment is preserved; compose triggers live-watchers using workspace filters, and Makefile runs unified command suites recursively.
