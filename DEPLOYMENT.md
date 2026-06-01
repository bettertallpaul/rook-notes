# Production Deployment Guide

This document outlines the production architecture, local container verification processes, and step-by-step instructions to deploy the entire **rook-notes** multi-service application to Google Cloud Run.

---

## 1. Production Architecture Overview

To ensure high performance, security, and low operational overhead, the production build transitions the application from a unified local development environment to an optimized, decoupled multi-service production container configuration. 

Rather than a single monolith, the production environment packages and deploys **three separate co-equal container services**:

1. **Frontend Client (`services/frontend/Dockerfile`)**:
   - **Base**: `nginx:alpine`
   - **Role**: Discards all Node.js and build-tool overhead, leaving a lean Nginx Alpine web server. It serves the pre-compiled static React client bundle (compiled locally in the development container and written to the bind-mounted host `services/frontend/dist` directory).
   - **Routing**: Employs an unbuffered reverse-proxy block to route traffic from `/api` to the backend Express API service dynamically via the injected `${API_URL}` environment variable.

2. **Express API Backend (`services/api/Dockerfile`)**:
   - **Base**: `node:24-bookworm-slim`
   - **Role**: Bypasses the TypeScript engine and `node_modules` entirely in production. It copy-executes the pre-compiled ESM vanilla JavaScript bundle (`services/api/dist/index.js`) compiled locally via `tsup`. This drops container sizes significantly and mitigates Cloud Run cold-starts down to subsecond speeds.
   - **AI Integration**: Runs the AI tag suggestion taxonomy via the Vercel AI SDK, utilizing the `GOOGLE_GENERATIVE_AI_API_KEY` key.
   - **SSE Streaming**: Manages real-time data change broadcasts to connected frontend clients via Server-Sent Events (SSE).

3. **Stateless MCP Server (`services/mcp/Dockerfile`)**:
   - **Base**: `node:24-bookworm-slim`
   - **Role**: Bypasses the TypeScript engine and `node_modules` entirely in production. It copy-executes the pre-compiled ESM vanilla JavaScript bundle (`services/mcp/dist/index.js`) compiled locally via `tsup`, providing intent-based tools (`search_notes`, `create_note`, `edit_note`, `delete_note`) for AI agent consumption.
   - **Downstream Connection**: Resolves and communicates with the active Express API backend using the `API_BASE_URL` environment variable.

---

## 2. Local Production Verification

Before pushing code changes to GitHub and triggering a cloud deployment, always validate the production build containers locally using OrbStack or standard Docker.

> [!IMPORTANT]
> **PORT BINDING CONFLICTS WITH DEVELOPMENT ENVIRONMENT:**
> Before running any production container lifecycle targets locally (like `make prod-run` or `make prod-verify`), **you must stand down your active local development containers** by running:
> ```bash
> make down
> ```
> Since both the development and production environments bind to the same host network ports (`3001` for Express API, `3002` for MCP server), attempting to run both simultaneously will cause a `Bind for 0.0.0.0:3001 failed: port is already allocated` network collision.

### A. Full Multi-Service Verification (Recommended)
To run a complete, automated end-to-end build, run, and connection verification pipeline for all three production containers simultaneously:
```bash
make prod-verify
```
This orchestrated target will:
1. Stop and clean up any existing local production container instances for all services.
2. Build all three production Docker images from their strict workspace contexts (`services/frontend/Dockerfile`, `services/api/Dockerfile`, and `services/mcp/Dockerfile`) in parallel.
3. Start all three containers in the background, properly configuring network ports and linking host gateway addresses between them.
4. Execute `curl` checks against all three endpoints in sequence:
   - Verifies the Frontend client serves dynamic resources correctly on port `8080`.
   - Verifies the API backend responds on port `3001` (injecting your secure `.env` variables).
   - Verifies the MCP server responds on port `3002`.
5. Gracefully tear down all containers cleanly once verification is complete.

### B. Frontend-only Verification
To run an automated build, run, and curl test pipeline strictly for the React web client and Nginx proxy layer:
```bash
make prod-app-verify
```
This target will build the React static bundles, serve them via a local Nginx Alpine container, test connection on `http://localhost:8080`, and clean up.

### C. Backend-only Verification
To compile, execute, and verify both backend containers (`api` and `mcp` services) in parallel:
```bash
make prod-backend-verify
```
This target compiles and runs the Express API (port `3001` mapping a local data volume) and MCP server (port `3002`), runs curl connectivity assertions, and stops the services.

### D. Manual Local Operations
If you want to manually run and debug services in parallel locally:
*   **Build all**: `make prod-build` (or individual targets: `make prod-app-build`, `make prod-api-build`, `make prod-mcp-build`)
*   **Run all**: `make prod-run` (or individual targets: `make prod-app-run`, `make prod-api-run`, `make prod-mcp-run`)
*   **Stop and Clean all**: `make prod-clean` (or individual targets: `make prod-app-clean`, `make prod-backend-clean`)

---

## 3. Declarative Production Release (CLI-First)

Unlike traditional manual browser configurations or complex GitHub-triggered Cloud Build setups, this project uses a deterministic, **terminal-driven local container packaging and declarative deployment** pipeline.

Container properties, limits, and environmental parameters are defined inside version-controlled Knative templates (`service.template.yaml`). At deploy time, these templates are dynamically compiled via `make` into untracked `service.yaml` manifests and applied directly to Google Cloud Run.

### A. Pre-requisites & Active GCP Project check
Before deploying, make sure you are authenticated with `gcloud` and have set the correct project:
```bash
gcloud auth login
gcloud config set project rook-notes-prod
```
The release targets automatically execute `gcp-auth-check` as a pre-flight validator to ensure you are deploying to the intended project.

---

## 4. Release Workflows

You can release code to Google Cloud Run using two primary workflows depending on whether you are releasing an official production update or deploying a dynamic sandbox/staging environment.

### Path A: Standard Production Release (from `main`)
This workflow is used to roll out verified, stable updates from the `main` branch to the production services (`rook-notes-api`, `rook-notes-mcp`, and `rook-notes-frontend`).

1. **Verify your local branch is up to date**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Deploy all services in order**:
   ```bash
   make prod-release-all
   ```
   This unified target compiles the monorepo workspace code, builds the production-ready containers locally using root-relative contexts, pushes the layers to Google Artifact Registry, and replaces the live Cloud Run services sequentially (API first, followed by MCP and Frontend to dynamically inject the active API URL downstream).

### Path B: Instant Staging/Sandbox Deployment (from Feature Branches)
Because the deployment flow is entirely declarative and parameterized, you can spin up isolated staging, sandbox, or UAT environments UAT directly from feature branches without affecting the live production application.

To deploy a custom staging instance, override the GCP configuration variables on the command line:
```bash
make prod-release-all GCP_PROJECT=rook-notes-staging GCP_REGION=us-east1
```
This command compiles the feature code, pushes the resulting container layers to a separate Artifact Registry under the `rook-notes-staging` project, and rolls out staging services isolated in the specified location.

---

## 5. Live Production Verification

Once all three services have successfully deployed, perform the following validation steps:

1. **Frontend Loading**:
   - Access the live frontend URL (available in the Cloud Run Console or via `gcloud run services describe rook-notes-frontend`).
   - Confirm that the UI renders instantly and static assets compile beautifully.
2. **Note Operations (React-API Sync)**:
   - Create a note, update its title, and add some tags.
   - Using your browser Developer Tools (`F12` -> Network tab), verify that CRUD requests sent to `/api/notes` resolve instantly through the Nginx proxy to the live `rook-notes-api` backend service.
3. **SSE Real-Time Broadcasts**:
   - Verify that updates appear instantly without page refreshes, confirming that Nginx handles Server-Sent Events (SSE) stream routing successfully without buffer locks.
4. **Agentic MCP Tool Verification**:
   - Query the live MCP server at `/mcp` using a standard Model Context Protocol client (like Claude Code) mapped to your live `rook-notes-mcp` service url.
   - Verify that the agent can successfully query, list, and edit database notes.

---

## 6. Operational Gotchas

### Ephemeral Storage and scale-to-zero State Loss

> [!WARNING]
> **IMPORTANT OPERATIONAL CHARACTERISTIC:**
> Since this project acts as a prototype sandbox, it is configured in **Ephemeral Mode** (stateless local container filesystem). 
>
> Google Cloud Run automatically scales containers down to **zero instances** when they are idle for a prolonged period of time (to conserve costs and CPU). Because Cloud Run containers are stateless, **any notes created or modified on the live service will be completely reset and wiped** whenever the container scales to zero.
>
> This behavior is fully accepted for this experimental stage. Avoid using the live playground deployment to store long-term or critical notes.
