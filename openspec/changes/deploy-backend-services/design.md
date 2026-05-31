## Context

As documented in the post-implementation learnings of `new-prod-build-process`, our existing deployment workflow only containerized the static React SPA served by Nginx. This left the application backend (Express API and MCP Server) running strictly in a local development environment. When deployed to Google Cloud Run, Nginx's proxy to the `/api` route failed with a **503 Service Unavailable** error due to the absence of the backend services. 

Furthermore, Cloud Run's serverless runtime environment introduces operational hurdles such as dynamic port binding, ephemeral filesystem wipes, and reverse proxy stream constraints. This design establishes a multi-service containerization and deployment process to allow the full rook-notes stack to execute in a production environment.

## Goals / Non-Goals

**Goals:**
- Containerize the Express API server using a production-grade `Dockerfile.api`.
- Containerize the stateless MCP server using a production-grade `Dockerfile.mcp`.
- Rename the root `Dockerfile` to `Dockerfile.app` to achieve fully symmetrical production build naming.
- Modify the Express API code to dynamically bind to the system-assigned `PORT` environment variable in production.
- Configure Nginx in `nginx.conf.template` to disable buffering and caching for `/api` requests, and extend timeouts to support real-time Server-Sent Events (SSE).
- Add host-level `Makefile` targets to build, run, and verify the production backend containers locally before deploying.
- Document the ephemeral data behavior for notes on Cloud Run (noting that note state is reset when the service is idle).
- Update `DEPLOYMENT.md` to serve as a comprehensive, step-by-step production deployment guide for all three Cloud Run services (Frontend, API, and MCP).
- Update `ARCHITECTURE.md` to adequately describe the latest multi-service production architecture, container structures, and ephemeral bindings.

**Non-Goals:**
- Re-architect the data access layer (e.g., migrating from `notes.json` to PostgreSQL or Supabase is out of scope for this change).
- Automate the Cloud Run creation/setup via CLI (this will be done manually using the Google Cloud Console, or handled in the future `automate-cloud-run-setup` task).

## Decisions

### 1. Frontend Container Naming (`Dockerfile.app`)
We rename the root `Dockerfile` to `Dockerfile.app`.
- **Rationale**: For symmetrical consistency across the multi-service deployment. Since the API and MCP servers use `Dockerfile.api` and `Dockerfile.mcp`, renaming the frontend to `Dockerfile.app` clarifies that the repository builds three co-equal services, rather than a single monolithic app.

### 2. API Containerization (`Dockerfile.api`)
We choose `node:24-bookworm-slim` to match the project's standard dev container base.
- **Alternatives considered**: `node:alpine` was considered but discarded to maintain parity with our dev guidelines and avoid compilation errors during dependency installs.
- **Caching**: The build uses pnpm cached mounts (`--mount=type=cache,id=pnpm,target=/pnpm/store`) to speed up subsequent local builds.
- **Pruning**: Playwright browsers and ONNX binaries are skipped via environment flags (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and `ONNXRUNTIME_NODE_INSTALL=skip`) to minimize image sizes.
- **Production Execution**: We explicitly bypass the development watch scripts (like `pnpm run api` which launches `tsx watch`) and start the process using direct execution: `CMD ["npx", "tsx", "src/server/api.ts"]`. This prevents file watcher overhead and memory bloat inside Cloud Run.

### 3. MCP Server Containerization (`Dockerfile.mcp`)
We choose to compile a separate `Dockerfile.mcp` image based on `node:24-bookworm-slim`.
- **Alternatives considered**: Bundling the MCP server inside the API image was considered. However, keeping them as separate containers adheres to the decoupled architecture documented in `ARCHITECTURE.md` (port 3001 vs port 3002) and allows them to scale independently.
- **Caching & Pruning**: Just like the API container, the MCP builder will use pnpm cached mounts and inject `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and `ONNXRUNTIME_NODE_INSTALL=skip` environment flags to prevent heavy native dependencies from hanging the Google Cloud Run builds.
- **Production Execution**: Just like the API, we bypass development scripts and run `CMD ["npx", "tsx", "src/server/mcp.ts"]` directly.

### 4. Dynamic Port Binding
We patch `src/server/api.ts` to prioritize `process.env.PORT` over `process.env.API_PORT`, and `src/server/mcp.ts` to prioritize `process.env.PORT` over `process.env.MCP_PORT`.
- **Rationale**: Google Cloud Run dynamically assigns a port at container startup and injects it into the `${PORT}` environment variable for each independent service container. Priority must be given to `${PORT}` in both codebases to pass serverless startup health checks and bind successfully inside their respective containers.

### 5. SSE Buffer Bypass in Nginx (`nginx.conf.template`)
We add explicit proxy buffering and caching control directives to the Nginx template for `/api` routing:
```nginx
proxy_buffering off;
proxy_cache off;
proxy_read_timeout 24h;
```
- **Rationale**: By default, Nginx buffers proxy streams. This blocks Server-Sent Events (SSE) payloads from reaching the client until the internal buffer is full. Disabling buffering ensures that data changes are broadcast instantly to the React frontend.

### 6. Ephemeral Playground Mode
The database module (`src/server/store.ts`) resolves the location of the `notes.json` file using the `DATA_DIR` environment variable (defaulting to `./data`).
- **Rationale**: Since the current deployment is strictly a local developer playground, we choose to adopt **Ephemeral Mode** (stateless container memory/filesystem). State resets when Cloud Run scales down to zero are fully acceptable for the current stage. A persistent database/volume strategy is **deferred** and will be introduced alongside a future vector search feature.

### 7. DevOps targets
We add new targets under the `# --- PRODUCTION VERIFICATION ---` section of the `Makefile`:
- `prod-api-build`: Builds the production API image (`rook-notes-api:prod`).
- `prod-mcp-build`: Builds the production MCP image (`rook-notes-mcp:prod`).
- `prod-api-run`: Runs the API container locally on port `3001` mapping data volumes.
- `prod-mcp-run`: Runs the MCP container locally on port `3002`.

### 8. Documentation Architecture (`DEPLOYMENT.md` and `ARCHITECTURE.md`)
- **`DEPLOYMENT.md`**: Rewrite this document to serve as the master manual for multi-service operations. It will detail setting up all three Cloud Run services, how to map the `API_URL` between them, configuring environment variables, and validating the ephemeral behavior.
- **`ARCHITECTURE.md`**: Update the core architecture description, project files tree, container listings, and diagrams to cleanly represent the production-ready state of the system where static and dynamic layers are separate, and note data behaves ephemerally.

## Risks / Trade-offs

- **[Risk]** Serverless Scale-to-Zero State Loss.
  - **[Mitigation]** This state loss is fully accepted as a playground design choice for this deployment. The documentation in `DEPLOYMENT.md` will explicitly warn the user that note data is ephemeral and resets during scale-down.
- **[Risk]** Connection timeouts on Server-Sent Events.
  - **[Mitigation]** The Nginx configuration disables buffering (`proxy_buffering off;`) and extends read timeouts (`proxy_read_timeout 24h;`) to ensure long-lived, uninterrupted client streams.
