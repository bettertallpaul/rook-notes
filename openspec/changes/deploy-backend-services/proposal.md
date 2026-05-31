## Why

Currently, the rook-notes production deployment (`new-prod-build-process`) only packages and spins up the static React SPA frontend served via Nginx. The backend Express API service and the MCP server are completely omitted in production, causing a 503 Service Unavailable error on API requests. We need a containerized multi-service deployment setup to run the complete local environment in production on Google Cloud Run.

## What Changes

- **[NEW]** Add a production `Dockerfile.api` to containerize the Express API backend service using `node:24-bookworm-slim` configured for non-watch production execution.
- **[NEW]** Add a production `Dockerfile.mcp` to containerize the stateless MCP server using `node:24-bookworm-slim` configured for non-watch production execution.
- **[RENAME]** Rename the root `Dockerfile` to `Dockerfile.app` to establish symmetrical production container naming across services.
- **[MODIFY]** Update `src/server/api.ts` and `src/server/mcp.ts` to support dynamic port binding through the cloud-injected `PORT` environment variable.
- **[MODIFY]** Update `nginx.conf.template` to support real-time SSE broadcasts by disabling proxy buffering/caching and extending proxy read timeouts.
- **[MODIFY]** Document the ephemeral playground storage behavior (accepting note state resets on container scale-down) for the JSON-based store in `src/server/store.ts`.
- **[MODIFY]** Extend `Makefile` with new production automation targets for backend verification (`prod-api-build`, `prod-api-run`, etc.).
- **[MODIFY]** Update `DEPLOYMENT.md` to serve as a comprehensive, step-by-step production deployment guide for all three serverless Cloud Run services (Frontend, API, and MCP).
- **[MODIFY]** Update `ARCHITECTURE.md` to adequately describe the latest multi-service production architecture, container structures, and ephemeral bindings.

## Capabilities

### New Capabilities
- `prod-deploy-backend`: Production deployment configuration and runtime orchestration for the backend services, enabling containerized Express API and MCP server hosting on Google Cloud Run, dynamic server port binding, SSE buffering configuration in Nginx, and ephemeral playground storage.

### Modified Capabilities

## Impact

- **Express API**: Codebase will listen on dynamic cloud ports and support variable persistence directory settings.
- **Nginx Config**: Reverse proxy rules will support long-lived Server-Sent Events (SSE) streams.
- **Development Tooling**: Makefile will include automated targets to verify production backend builds locally.
- **Infrastructure**: Three decoupled container images will be managed under separate Cloud Run endpoints.
