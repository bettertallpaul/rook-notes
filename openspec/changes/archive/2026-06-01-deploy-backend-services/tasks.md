## 1. Containerization Infrastructure

- [x] 1.1 Create `Dockerfile.api` in the project root to package the Express API backend using `node:24-bookworm-slim` with pnpm caching, skip flags (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`/`ONNXRUNTIME_NODE_INSTALL=skip`), and direct non-watch run execution (`CMD ["npx", "tsx", "src/server/api.ts"]`).
- [x] 1.2 Create `Dockerfile.mcp` in the project root to package the stateless MCP server using `node:24-bookworm-slim` with skip flags (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`/`ONNXRUNTIME_NODE_INSTALL=skip`), and direct non-watch run execution (`CMD ["npx", "tsx", "src/server/mcp.ts"]`).
- [x] 1.3 Rename the root `Dockerfile` to `Dockerfile.app`.
- [x] 1.4 Update `.dockerignore` to ensure build contexts remain light and optimal.

## 2. API & Server Configuration

- [x] 2.1 Modify `src/server/api.ts` to listen on `process.env.PORT ?? process.env.API_PORT ?? '3001'` to enable Cloud Run port binding.
- [x] 2.2 Verify that `src/server/store.ts` correctly creates target database directories when resolving `DATA_DIR`.
- [x] 2.3 Modify `src/server/mcp.ts` to listen on `process.env.PORT ?? process.env.MCP_PORT ?? '3002'` to enable Cloud Run port binding for the MCP server.

## 3. Nginx Server Configuration

- [x] 3.1 Modify `nginx.conf.template` to include `proxy_buffering off;`, `proxy_cache off;`, and `proxy_read_timeout 24h;` in the `/api` proxy block to support long-lived Server-Sent Events (SSE).

## 4. Makefile DevOps Automation

- [x] 4.1 Update existing frontend Makefile targets (`prod-build`, etc.) to use `Dockerfile.app`, and add new automation targets for backend container compilation: `prod-api-build` and `prod-mcp-build`.
- [x] 4.2 Add Makefile targets to run and tear down backend containers locally: `prod-api-run`, `prod-mcp-run`, and `prod-backend-clean`.
- [x] 4.3 Implement a comprehensive local backend verification target `prod-backend-verify` to automatically run and test container connectivity.

## 5. Local Integration Testing

- [x] 5.1 Compile and run all three production-grade container services locally (Frontend, API, MCP) in parallel.
- [x] 5.2 Perform note CRUD operations in the browser to verify full React-API communication.
- [x] 5.3 Connect to the local production MCP endpoint (`/mcp` route) and verify it successfully resolves database tools.

## 6. Documentation Updates

- [x] 6.1 Update `DEPLOYMENT.md` to outline the multi-service deployment process on Google Cloud Run, environment configurations (including `API_URL`, `API_BASE_URL`, and `GOOGLE_GENERATIVE_AI_API_KEY`), and explicit warnings about the ephemeral storage characteristics.
- [x] 6.2 Update `ARCHITECTURE.md` to accurately illustrate the decoupled production state of the system with ephemeral note store characteristics.

## 7. Live Google Cloud Run Verification (User Step)

- [ ] 7.1 Deploy the Express API service on Google Cloud Run in Ephemeral Mode using the `Dockerfile.api` build target, ensuring the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable is configured for AI tag suggestions.
- [ ] 7.2 Deploy the stateless MCP server on Google Cloud Run using the `Dockerfile.mcp` configuration, and set its `API_BASE_URL` environment variable to point to the live HTTPS URL of the deployed Express API service.
- [ ] 7.3 Configure the Frontend service environment variable `API_URL` to point to the live HTTPS URL of the deployed Express API.
- [ ] 7.4 Navigate to the live frontend URL in a browser and verify that SSE-driven updates and tag suggestion workflows function correctly.

---

## Archival & Pivot Note (2026-06-01)

During live Google Cloud Run verification, the direct containerization approach running `npx tsx` on startup in the ephemeral containers was found to be too convoluted and buggy. Building inside the production container environments on serverless runtimes led to cold start latency and runtime dependency inconsistencies. 

### Selected Pivot Path:
We are pivoting to a **Multi-Service Local Container Compilation & Delta Pushes** (or **Artifact-First Build-Outside-Docker**) packaging pattern, which is now documented in `session_summary.md` and slated for refactoring under the backlog. Key highlights of the new strategy:
1. **Local pre-compilation:** Compile frontend static assets and transpile backend TS to pure ESM JS inside the Node 24 development container in OrbStack (`make build`).
2. **Lean single-stage containers:** Build ultra-lightweight Docker images (`~30-50MB`) that copy pre-compiled `./dist` folders and run native `node` instead of transpiling on boot, leading to sub-second cold starts.
3. **Optimized organization:** Symmetrical, clean Dockerfiles grouped within a dedicated `services/` folder.

As a result, this experimental feature branch is being archived with incomplete verification steps.

