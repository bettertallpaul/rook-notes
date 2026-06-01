## 1. Workspace Scaffolding & Setup

- [x] 1.1 Create `pnpm-workspace.yaml` in repository root
- [x] 1.2 Scaffold workspace subdirectories: `services/shared`, `services/frontend`, `services/api`, `services/mcp`
- [x] 1.3 Configure `services/shared/package.json` and `services/shared/tsconfig.json` for ESM build with typescript type declarations output (`dist/`)
- [x] 1.4 Configure `services/frontend/package.json` and `services/frontend/tsconfig.json` for React Client SPA
- [x] 1.5 Configure `services/api/package.json` and `services/api/tsconfig.json` for Express API development commands
- [x] 1.6 Configure `services/mcp/package.json` and `services/mcp/tsconfig.json` for MCP development commands
- [x] 1.7 Add local workspace packages dependency declaration to other service workspaces (`"@rook/shared": "workspace:*"`)
- [x] 1.8 Restructure the root `package.json` and root `tsconfig.json` to act as monorepo root configurations and coordinators

## 2. Code Relocation & Boundary Management

- [x] 2.1 Migrate Zod schemas and configurations to `services/shared/src/schemas.ts` and verify compilation to `dist/`
- [x] 2.2 Relocate React frontend application files (components, hooks, lib, store, types, App.tsx, index.css, main.tsx, index.html, vite.config.ts) to `services/frontend/`
- [x] 2.3 Relocate Express API backend code (`src/server/api.ts`, `src/server/ai/`, `src/server/events/`, `src/server/store.ts`) to `services/api/src/`
- [x] 2.4 Relocate Model Context Protocol code (`src/server/mcp.ts`) to `services/mcp/src/`
- [x] 2.5 Refactor all internal file imports across frontend, api, and mcp packages to import from `@rook/shared` instead of relative path backtracking (e.g. `../../shared/schemas`)
- [x] 2.6 Delete the legacy root `src/` directory from the repository

## 3. Development Environment Realignment

- [x] 3.1 Reconfigure `docker-compose.yml` to trigger service dev scripts using pnpm workspace filters (e.g. `pnpm --filter @rook/frontend dev`)
- [x] 3.2 Update `Dockerfile.dev` to use `pnpm fetch` caching strategy (fetching dependencies from `pnpm-lock.yaml` before copying the workspace tree) so `pnpm install` succeeds without breaking Docker layer caching
- [x] 3.3 Update the repository `Makefile` up, shell, install, dev, and build targets to align with workspaces structure

## 4. Local Development Verification Milestone

- [x] 4.1 Execute local dev environment `make up` and check that all three containers boot successfully in parallel
- [x] 4.2 Validate frontend SPA loading, notes fetching, and tag suggestions inside the dev environment
- [x] 4.3 Validate hot-reloading when modifying a Zod schema in `@rook/shared` to confirm native workspace link reactivity
- [x] 4.4 Run unit tests locally (if any) to confirm code behavior remains identical to old layout
- [x] 4.5 **USER SIGN-OFF**: Explicitly request user review and verification of local development environment stability before continuing to Phase 5

## 5. Production Bundling & Containerization Setup

- [x] 5.1 Configure `tsup` in `services/api/package.json` and verify Express API server builds into a single self-contained `services/api/dist/index.js` file
- [x] 5.2 Configure `tsup` in `services/mcp/package.json` and verify MCP server builds into a single self-contained `services/mcp/dist/index.js` file
- [x] 5.3 Create production `services/frontend/Dockerfile` utilizing local compiled static files and serving them via Nginx Alpine
- [x] 5.4 Create production `services/api/Dockerfile` copy-executing pre-compiled ESM vanilla JavaScript output directly on native `node` runtime engine
- [x] 5.5 Create production `services/mcp/Dockerfile` copy-executing pre-compiled ESM vanilla JavaScript output directly on native `node` runtime engine
- [x] 5.6 Update root `.dockerignore` to explicitly allow `dist/` directories via `!services/*/dist/` so production builds can copy the compiled artifacts
- [x] 5.7 Remove the legacy production Dockerfiles from root (`Dockerfile.app`, `Dockerfile.api`, `Dockerfile.mcp`)
- [x] 5.8 Update `Makefile` production local checking pipeline (`prod-build`, `prod-run`, `prod-verify`) to build from the strict workspace context paths (e.g. `docker build -f services/api/Dockerfile services/api`)

## 6. Production Pipeline Verification & Documentation

- [x] 6.1 Execute production verification pipeline `make prod-verify` to ensure compilation, single-stage packaging, and local runtime verification checks succeed
- [x] 6.2 Update `ARCHITECTURE.md` to reflect the decoupled native pnpm monorepo design
- [x] 6.3 Update `DEPLOYMENT.md` detailing the Artifact-First deployment pipeline and cold-start mitigations

