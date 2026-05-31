# Production Deployment Guide

This document outlines the production architecture, local container verification processes, and step-by-step instructions to deploy the entire **rook-notes** multi-service application to Google Cloud Run.

---

## 1. Production Architecture Overview

To ensure high performance, security, and low operational overhead, the production build transitions the application from a unified local development environment to an optimized, decoupled multi-service production container configuration. 

Rather than a single monolith, the production environment packages and deploys **three separate co-equal container services**:

1. **Frontend Client (`Dockerfile.app`)**:
   - **Base**: `nginx:alpine`
   - **Role**: Discards all Node.js and build-tool overhead, leaving a lean Nginx Alpine web server. It serves the pre-compiled static React client bundle (compiled in the first-stage `node:24-bookworm-slim` builder).
   - **Routing**: Employs an unbuffered reverse-proxy block to route traffic from `/api` to the backend Express API service dynamically via the injected `${API_URL}` environment variable.

2. **Express API Backend (`Dockerfile.api`)**:
   - **Base**: `node:24-bookworm-slim`
   - **Role**: Executes the core backend Express app directly (`npx tsx src/server/api.ts`) in a clean, non-watch production environment.
   - **AI Integration**: Runs the AI tag suggestion taxonomy via the Vercel AI SDK, utilizing the `GOOGLE_GENERATIVE_AI_API_KEY` key.
   - **SSE Streaming**: Manages real-time data change broadcasts to connected frontend clients via Server-Sent Events (SSE).

3. **Stateless MCP Server (`Dockerfile.mcp`)**:
   - **Base**: `node:24-bookworm-slim`
   - **Role**: Executes the Streamable HTTP Model Context Protocol (MCP) server directly (`npx tsx src/server/mcp.ts`), providing intent-based tools (`search_notes`, `create_note`, `edit_note`, `delete_note`) for AI agent consumption.
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
2. Build all three production Docker images (`Dockerfile.app`, `Dockerfile.api`, and `Dockerfile.mcp`) in parallel.
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

## 3. Preparing the Production Branch
<!-- TODO: my process no longer involves dev/main, but rather new branches created for various features/fixes/etc that get merged back into main and deleted once they have served their purpose. Need to update this section accordingly. -->

Because active development takes place on the `dev` branch, your newly created production configurations currently only exist on `dev`. Google Cloud Run triggers are designed to build from your production branch (`main`). Therefore, you must push your `dev` changes to GitHub and merge them into `main` **before** connecting the services in the Google Cloud Console.

### Merge workflow:
```bash
git add .
git commit -m "feat: implement multi-service production container setup"
git push origin dev

# Merge to main
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
```

---

## 4. Step-by-Step Google Cloud Run Console Setup

To deploy the entire rook-notes suite, you will configure and deploy **three separate Cloud Run services** sequentially.

> [!TIP]
> **Perpetual Free Tier Guidelines:**
> - **CPU Allocation**: Select **Request-based** (CPU is only allocated during request processing) so you are not charged when services are idle.
> - **Scaling**: Set **Minimum instances** to `0` (essential for scale-to-zero).
> - **Resources**: Set memory to `512 MiB` and CPU to `1 vCPU` under the Container tab (more than enough for these lightweight services).

### Service 1: Express API Service (`rook-notes-api`)
The API service acts as the heart of the system and must be deployed first so other services can reference its live URL.

1. Navigate to the **Cloud Run** console page and click **Create Service**.
2. Select **Deploy revision from a source repository** and click **Set up with Cloud Build**.
3. Select the `rook-notes` repository and click **Next**.
4. Set the build trigger branch to `main`.
5. Under **Build Type**, select **Dockerfile**. Set the path to `Dockerfile.api` and click **Save**.
6. Name the service: `rook-notes-api` and choose a Tier 1 region close to you.
7. Select **Request-based** CPU allocation and **Allow unauthenticated invocations**.
8. Scroll down to **Container, Networking, Security** -> **Container tab**:
   - Set **Container Port** to `3001` (Cloud Run dynamically forwards incoming traffic here).
   - Set **Minimum instances** to `0` and **Maximum instances** to `5`.
   - **Environment Variables**: Add your secure AI API key:
     - **Name**: `GOOGLE_GENERATIVE_AI_API_KEY`
     - **Value**: `[Your actual Google AI API Key]`
9. Click **Create** to launch the deployment. Once complete, copy the generated HTTPS URL (e.g., `https://rook-notes-api-xxxxxx.a.run.app`).

### Service 2: Stateless MCP Server (`rook-notes-mcp`)
The MCP server provides tool interfaces for AI agents and queries the API backend downstream.

1. Click **Create Service** in the Cloud Run console.
2. Select **Deploy revision from a source repository** and configure Cloud Build.
3. Select the `rook-notes` repository, set the branch to `main`.
4. Under **Build Type**, select **Dockerfile**. Set the path to `Dockerfile.mcp` and click **Save**.
5. Name the service: `rook-notes-mcp`.
6. Select **Request-based** CPU allocation and **Allow unauthenticated invocations**.
7. Under **Container** settings:
   - Set **Container Port** to `3002`.
   - Set **Minimum instances** to `0` and **Maximum instances** to `5`.
   - **Environment Variables**: Map the server to your live Express API URL:
     - **Name**: `API_BASE_URL`
     - **Value**: `https://rook-notes-api-xxxxxx.a.run.app` (The URL copied from Service 1)
8. Click **Create** to launch the service.

### Service 3: Frontend Client (`rook-notes-frontend`)
The web client serves compiled React assets via Nginx and proxies `/api` calls downstream.

1. Click **Create Service** in the Cloud Run console.
2. Configure Cloud Build for the `rook-notes` repository on the `main` branch.
3. Under **Build Type**, select **Dockerfile**. Set the path to `Dockerfile.app` (the renamed root Dockerfile) and click **Save**.
4. Name the service: `rook-notes-frontend`.
5. Select **Request-based** CPU allocation and **Allow unauthenticated invocations**.
6. Under **Container** settings:
   - Set **Container Port** to `80`.
   - Set **Minimum instances** to `0` and **Maximum instances** to `5`.
   - **Environment Variables**: Point Nginx to your backend API:
     - **Name**: `API_URL`
     - **Value**: `https://rook-notes-api-xxxxxx.a.run.app` (The URL copied from Service 1)
7. Click **Create** to launch the service. Once built, access the live React web client via the generated frontend HTTPS URL!

---

## 5. Live Production Verification

Once all three services have successfully deployed, perform the following validation steps:

1. **Frontend Loading**:
   - Access the live frontend URL (e.g., `https://rook-notes-frontend-xxxxxx.a.run.app`).
   - Confirm that the UI renders instantly and static assets compile beautifully.
2. **Note Operations (React-API Sync)**:
   - Create a note, update its title, and add some tags.
   - Using your browser Developer Tools (`F12` -> Network tab), verify that CRUD requests sent to `/api/notes` resolve instantly through the Nginx proxy to the live `rook-notes-api` backend service.
3. **SSE Real-Time Broadcasts**:
   - Verify that updates appear instantly without page refreshes, confirming that Nginx handles Server-Sent Events (SSE) stream routing successfully without buffer locks.
4. **Agentic MCP Tool Verification**:
   - Query the live MCP server at `/mcp` using a standard Model Context Protocol client (like Claude Code) mapped to `https://rook-notes-mcp-xxxxxx.a.run.app/mcp`.
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
