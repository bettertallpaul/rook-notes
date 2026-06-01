## Context

Currently, the **rook-notes** codebase is co-located in a single monolith where the frontend Vite SPA, the Express API backend, and the Model Context Protocol (MCP) server reside in a single directory tree. The dependencies of all three services are co-located in a single `package.json`. In production, the backend services (`api` and `mcp`) are launched inside Google Cloud Run using the `npx tsx` command on-the-fly, requiring typescript execution and file processing at boot-time. This results in severe cold start latencies (3-5+ seconds) on Google Cloud Run.

This design moves all compilation outside the Docker containers (**Artifact-First packaging**) via compilation inside the Node 24 development container in OrbStack, reorganizing the codebase into native **`pnpm workspaces`** under `services/`, and introducing a pre-compiled bundling workflow.

---

## Goals / Non-Goals

**Goals:**
- Separate frontend client, backend Express API, MCP server, and shared assets into distinct workspaces under `services/`.
- Pre-compile the API and MCP servers into thin, optimized, standalone ESM JavaScript files (`dist/index.js`).
- Eliminate the execution of `npx tsx` and the TypeScript engine from the production containers.
- Re-architect production Dockerfiles to be single-stage, lightweight copies of pre-compiled local artifacts.
- Keep the local development hot-reloading environment fully intact using workspace-filtered dev scripts.
- Refactor the imports across services to reference `@rook/shared` natively using `pnpm workspaces` symlinking rather than brittle relative file paths.

**Non-Goals:**
- Migrating from JSON file-based storage (`notes.json`) to database engines.
- Refactoring core application features or adding authentication.

---

## Decisions

### 1. Monorepo Architecture via `pnpm workspaces`
We will create a `pnpm-workspace.yaml` in the root:
```yaml
packages:
  - 'services/*'
```
We will separate the codebase into four packages inside `services/`:
- `services/shared` (`@rook/shared`): Common Zod schemas and type definitions.
- `services/frontend` (`@rook/frontend`): Vite React client SPA.
- `services/api` (`@rook/api`): Express API backend.
- `services/mcp` (`@rook/mcp`): Model Context Protocol server.

*Alternatives considered:* Keeping a single package and using subdirectories without workspaces was rejected because it does not isolate dependency trees or support clean, package-based TypeScript builds.

### 2. Single-File ESM Bundling via `tsup` for Node Services
We will introduce `tsup` (a fast, zero-config TypeScript bundler powered by `esbuild`) to compile the Node backend services.
- **For API (`@rook/api`)**: `tsup src/api.ts --format esm --target node24 --clean` will compile the code and dependencies into a single production file `dist/index.js`.
- **For MCP (`@rook/mcp`)**: `tsup src/mcp.ts --format esm --target node24 --clean` will compile into `dist/index.js`.
- **For Shared (`@rook/shared`)**: `tsc` will transpile code and generate type declarations `.d.ts` in `dist/`.

*Alternatives considered:* Direct compilation using plain `tsc` was rejected because `tsc` outputs a modular directory tree mirroring the source tree, requiring us to manage a complex multi-stage production Dockerfile to copy workspace files, lockfiles, and run `pnpm install --prod` inside the production container. Bundling with `tsup` makes the production backend Dockerfiles completely self-contained and free of `node_modules` entirely.

### 3. Symmetrical, Single-Stage Production Dockerfiles
Because compilation and packaging happen outside the production containers during local building (`make build`), the production Dockerfiles become extremely simple, fast, and secure:

- **API Dockerfile (`services/api/Dockerfile`)**:
  ```dockerfile
  FROM node:24-bookworm-slim
  WORKDIR /app
  COPY dist/index.js ./index.js
  EXPOSE 3001
  CMD ["node", "index.js"]
  ```
- **MCP Dockerfile (`services/mcp/Dockerfile`)**:
  ```dockerfile
  FROM node:24-bookworm-slim
  WORKDIR /app
  COPY dist/index.js ./index.js
  EXPOSE 3002
  CMD ["node", "index.js"]
  ```
- **Frontend Dockerfile (`services/frontend/Dockerfile`)**:
  ```dockerfile
  FROM nginx:alpine
  COPY nginx.conf.template /etc/nginx/templates/default.conf.template
  COPY dist /usr/share/nginx/html
  ENV PORT=80 API_URL=http://localhost:3001 NGINX_ENVSUBST_FILTER="^(PORT|API_URL)$"
  EXPOSE 80
  ```

*Alternatives considered:* Multi-stage remote compilation was rejected because compilation on cloud runners is slow, lacks local compilation cache persistence, and requires pulling massive dependency chains over the network.

### 4. Development Orchestration & Hot Reloading
To preserve the current developer experience, our `docker-compose.yml` services will bind-mount the entire monorepo root and execute workspace dev scripts in parallel:
- **`app` container (Frontend)**: Runs `pnpm --filter @rook/frontend dev`.
- **`api` container (API Backend)**: Runs `pnpm --filter @rook/api dev` (executes tsx watch).
- **`mcp` container (MCP Server)**: Runs `pnpm --filter @rook/mcp dev` (executes tsx watch).

This ensures hot-reloading works perfectly across all services (including immediate propagation of changes inside `@rook/shared`!).

---

## Risks / Trade-offs

- **[Risk] Out-of-sync local production artifacts**: If we build and push a production image without compiling the latest changes, the deployed service will run stale code.
  - **[Mitigation]** The `Makefile`'s unified production build commands (`prod-build`, `prod-api-build`, etc.) will be configured to automatically trigger the pre-compile process `make build` before packaging, making build-staleness impossible.
- **[Risk] Path mapping and directory structure inside Docker**: The database module (`store.ts`) writes notes to the path defined in `DATA_DIR` environment variable. Moving code to `services/api/` shifts the relative root directory location inside the container.
  - **[Mitigation]** We will ensure `store.ts` file path lookups use absolute paths (e.g. using `path.resolve(process.env.DATA_DIR || './data')`) so they remain robust regardless of where the script runs in the package tree.
