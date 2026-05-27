## Context

The rook-notes React SPA currently uses a development-focused Docker container setup (`Dockerfile.dev`, bind-mounted directories, and Vite's development server). To prepare the application for a production environment, specifically Google Cloud Run, we need to transition to a two-stage production build process. The production build must package a optimized production bundle of the React app and serve it using a lightweight Nginx web server. The Nginx server also needs to dynamically handle port binding and proxy frontend requests on the `/api` route to a configurable backend API.

## Goals / Non-Goals

**Goals:**
- Implement a two-stage production Docker build (`Dockerfile`) that compiles TypeScript/React code with Node 24 and `pnpm`, then copies the output to a clean `nginx:alpine` runner stage.
- Configure dynamic port binding (`PORT`) and API request proxying (`API_URL`) using Nginx's built-in `.template` processing via `envsubst` at container startup.
- Add host-level automation to the `Makefile` (`prod-build`, `prod-run`, `prod-test`, `prod-clean`, and `prod-verify`) to build, run, test, and tear down the production setup locally inside OrbStack/Docker before deploying.

**Non-Goals:**
- Automate the actual deployment/upload of the container to Google Cloud Run (out of scope for this change).
- Modify the backend Express API codebase or its specific container setup.
- Replace the current dev environment workflow; development will continue to use `Dockerfile.dev` and the Vite dev server.

## Decisions

### 1. Builder Base Image Selection
We choose `node:24-bookworm-slim` to match the project's standard dev container base.
- **Alternatives considered**: `node:alpine` was considered but dismissed to maintain consistent build parity with the existing development environment guidelines defined in `AGENTS.md`.
- **Caching**: The build uses pnpm cached mounts (`--mount=type=cache,id=pnpm,target=/pnpm/store`) to speed up subsequent local builds.

### 2. Runner Base Image Selection
We choose `nginx:alpine` for the runner stage.
- **Alternatives considered**: Serving static assets via a Node/Express process was considered. However, Nginx is substantially more performant, uses significantly fewer system resources, has a smaller security attack surface, and features native support for environment variable substitution.

### 3. Dynamic Environment Variables (`PORT` and `API_URL`)
We configure Nginx with `envsubst` by placing `nginx.conf.template` at `/etc/nginx/templates/default.conf.template`.
- **Rationale**: Cloud Run dynamically binds to a port specified by the `${PORT}` environment variable. Additionally, the React app needs to communicate with the API on the `/api` path. Placing the config as a template allows Nginx to substitute `${PORT}` and `${API_URL}` automatically at startup, removing the need for hardcoded endpoints in the container.

### 4. Makefile DevOps Targets
We add automated verification targets to the root `Makefile` including a unified `prod-verify` target.
- **Rationale**: Local offline validation is vital. The `prod-verify` target automatically handles container cleanup, image compilation, starting the production Nginx server locally, checking HTTP responses using `curl`, and final clean up.

### 5. Makefile Structural Reorganization
We will reorganize the root `Makefile` into clean, logical categories with commented headers.
- **Rationale**: As the number of Makefile targets grows, keeping them structured makes it much easier to maintain, read, and use.
- **Categories**: We will group targets under:
  - `# --- HELP / UTILITIES ---` (`help`, `.DEFAULT_GOAL`)
  - `# --- DEVELOPMENT WORKFLOW ---` (`up`, `dev`, `shell`, `install`, `build`, `test`, `down`, `purge`, `fresh`)
  - `# --- DATABASE / SEEDING ---` (`seed`)
  - `# --- DESIGN SYSTEM TOOLS ---` (`design-lint`, `design-diff`, `design-export`, `design-spec`)
  - `# --- PRODUCTION VERIFICATION ---` (`prod-build`, `prod-run`, `prod-test`, `prod-clean`, `prod-verify`)

### 6. Deployment Documentation (DEPLOYMENT.md)
We will create a `DEPLOYMENT.md` file in the root of the repository to serve as the definitive guide for pushing to production.
- **Content Structure**: The guide will cover:
  - Architecture overview (builder stage, Nginx runner stage, dynamic port binding, SPA routing).
  - Local validation options (automated `make prod-verify` and manual individual Makefile targets).
  - Detailed step-by-step console instructions for connecting the GitHub repository to Google Cloud Run with Cloud Build triggers.
  - Operational gotchas (such as in-memory state reset on scale-down, pnpm headless build parameters).

### 7. Branching Workflow Transition
To align with a safe release strategy where production builds are triggered automatically from the `main` branch, all ongoing development work should occur on a dedicated `dev` branch.
- **Option A: Antigravity IDE GUI Method (Recommended)**:
  1. Click on the active branch name (usually `main`) in the **Status Bar** (bottom-left corner of the IDE) or open the Command Palette (`Cmd+Shift+P`) and type `Git: Checkout to...`.
  2. Select **`+ Create new branch...`** from the dropdown menu.
  3. Type `dev` as the new branch name and press `Enter`.
  4. Navigate to the **Source Control View** (click the source control branch icon in the Activity Bar on the far left, or press `Ctrl+Shift+G`).
  5. Click the **Publish Branch** button to push `dev` to the remote repository and establish upstream tracking.
- **Option B: Command Line Method**:
  1. Ensure you are on the latest `main` branch: `git checkout main && git pull`
  2. Create and switch to the `dev` branch locally: `git checkout -b dev`
  3. Push the `dev` branch to the remote repository: `git push -u origin dev`
- **Future Practices**: Ensure `dev` remains the active development branch. All future features and bugfixes are committed to `dev` first. When ready to release, open a Pull Request from `dev` to `main` (which will trigger the automated Cloud Run build upon merge).



## Risks / Trade-offs

- **[Risk]** API Proxy path routing fails in production.
  - **[Mitigation]** The Nginx configuration matches precisely `/api` and forwards the request downstream via `proxy_pass ${API_URL}`, preserving headers and upgrade parameters to maintain WebSocket or standard session compatibility if needed.
- **[Risk]** Hostname mapping issues during local test run on macOS (e.g. localhost of host vs container).
  - **[Mitigation]** The `prod-run` target configures `--add-host=host.docker.internal:host-gateway` and runs with `API_URL=http://host.docker.internal:3001` so that the local Nginx container can reach the backend dev API running on the host or in its compose environment.

