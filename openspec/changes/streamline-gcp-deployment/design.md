## Context

The previous refactoring phase successfully introduced workspace modularization, fast ESM bundling via `tsup`, and single-stage production Dockerfiles. However, the current deployment strategy relies on Google Cloud Build triggers executing remote builds directly from GitHub. Because these single-stage Dockerfiles copy pre-compiled, gitignored build outputs (`dist/`) created locally, remote cloud builds immediately fail unless minified build artifacts are actively committed directly to source control, which causes repository bloat, pull request pollution, and persistent merge conflicts.

This design shifts the deployment architecture to **Pure Local Container Delivery** using version-controlled Knative `service.template.yaml` templates and automated `Makefile` dynamic interpolation, pushing, and replacement release flows.

---

## Goals / Non-Goals

**Goals:**
- Eliminate GitHub-triggered Google Cloud Build pipelines and web UI configurations.
- Allow pure local compilation, local packaging within the local OrbStack Docker engine, and direct Artifact Registry pushing.
- Keep the `dist/` build folders and generated target `service.yaml` files securely within `.gitignore` to maintain clean git history.
- Define container properties (ports, resources, environment keys) declaratively inside version-controlled `service.template.yaml` manifests.
- Avoid the Cloud Run `:latest` deployment caching trap by injecting dynamic deploy timestamps into annotations.
- Resolve downstream dependencies dynamically (e.g., dynamically fetching and injecting the live API URL into MCP and Frontend configs) to prevent hardcoded URL drift.
- Standardize all production Dockerfiles to use the repository root `.` as the build context for uniform layering and cross-service caching.
- Optimize the repository `.dockerignore` to exclude raw source files and local development state, drastically reducing Docker context overhead.
- Update `DEPLOYMENT.md` to detail the terminal-driven, declarative release model.

**Non-Goals:**
- Setting up persistent databases or multi-region high availability.
- Configuring custom domain mapping in this specific change.

---

## Decisions

### 1. Pure Local Container Delivery Workflow
We will compile and package production containers locally within our developer context, pushing fully-formed images directly to GCP Artifact Registry:
```text
[Local TypeScript] ──> [tsup/Vite Build] ──> [OrbStack Docker Build] ──> [gcloud push Image] ──> [gcloud run replace]
```
- **Rationale**: Keeps `dist/` files inside local gitignore rules, preventing Git history bloat. Pushing a lightweight compiled container layer directly to the registry is significantly faster than spinning up a remote cloud runner instance.
- **Alternatives Considered**: 
  - *Committing `dist/` to Git*: Rejected because it pollutes pull requests and causes constant merge conflicts across branches.
  - *Multi-stage remote container builds*: Rejected because npm installation, cache restoration, and typescript compilation on standard cloud runners takes several minutes compared to subsecond local cached compilations.

### 2. Native Knative Declarative Templates (`service.template.yaml`)
To support true environment isolation and decouple the repository from environment-specific live URLs, we will introduce `service.template.yaml` templates inside each service folder:
- `services/api/service.template.yaml` (Template for port `3001` container setup)
- `services/mcp/service.template.yaml` (Template for port `3002` container setup)
- `services/frontend/service.template.yaml` (Template for port `80` container setup)

These template manifests utilize placeholders:
- `DEPLOY_TIMESTAMP_PLACEHOLDER`: Injected into the metadata annotations (`deploy-timestamp`) to force Google Cloud Run to trigger a new revision rollout, bypassing the `:latest` revision cache trap.
- `API_URL_PLACEHOLDER` / `API_BASE_URL_PLACEHOLDER`: Interpolated dynamically at deploy time.
- `REGISTRY_PLACEHOLDER` / `GCP_REGION_PLACEHOLDER`: Universalizes registry paths across GCP projects.

- **Rationale**: Keeps configuration version-controlled, dry, and easily readable by AI agents and developers, avoiding hardcoded URL configuration drift.
- **Alternatives Considered**: 
  - *Static `service.yaml` files*: Rejected because they force hardcoding dynamic Cloud Run URLs and fail to trigger new revision rollouts under unchanged `:latest` image strings.
  - *Imperative CLI commands*: Rejected because they scatter configurations across makefiles or command lines, making audit and review impossible.

### 3. Symmetrical Root-Relative Production Dockerfiles
We will standardize all production Dockerfiles to be built using the project root directory `.` as their build context. 
- **Frontend Dockerfile (`services/frontend/Dockerfile`)**:
  ```dockerfile
  FROM nginx:alpine
  COPY services/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
  COPY services/frontend/dist /usr/share/nginx/html
  ENV PORT=80 API_URL=http://localhost:3001 NGINX_ENVSUBST_FILTER="^(PORT|API_URL)$"
  EXPOSE 80
  ```
- **API Dockerfile (`services/api/Dockerfile`)**:
  ```dockerfile
  FROM node:24-bookworm-slim
  WORKDIR /app
  COPY services/api/dist/index.js ./index.js
  EXPOSE 3001
  ENV NODE_ENV=production
  CMD ["node", "index.js"]
  ```
- **MCP Dockerfile (`services/mcp/Dockerfile`)**:
  ```dockerfile
  FROM node:24-bookworm-slim
  WORKDIR /app
  COPY services/mcp/dist/index.js ./index.js
  EXPOSE 3002
  CMD ["node", "index.js"]
  ```
- **Rationale**: Consistently executing builds from the repository root enables excellent layer caching, makes resolving cross-workspace dependencies trivial, and standardizes image generation.
- **Alternatives Considered**: Building from individual workspace subdirectories. Rejected because sub-package context builds cannot share root properties or config structures.

### 4. Root-Level `.dockerignore` Optimization
We will expand the root `.dockerignore` file to explicitly exclude all development files and raw source directories:
```text
# Ignore raw source code since we only deploy compiled dist/ bundles
services/frontend/src
services/api/src
services/mcp/src
```
- **Rationale**: Drastically reduces local Docker build context sizes. Since the Docker files only copy compiled `dist/` folders, uploading raw source files and local development state to the OrbStack build context is a major source of lag.
- **Alternatives Considered**: Standard multi-stage building (rejected due to cold starts and build latency).

### 5. Makefile-Driven Compilation, Interpolation, and Release
We will add standard release targets to our `Makefile` executing builds from the root context:
`docker build -t $(REGISTRY)/api:latest -f services/api/Dockerfile .`
The targets will automate:
- Compiling code.
- Querying active API URLs.
- Replacing placeholders via `sed` to generate untracked `service.yaml` files.
- Pushing images and applying Knative manifests.

---

## Risks / Trade-offs

- **[Risk] Exposing secure API keys in git-versioned templates**
  - **[Mitigation]** Sensitive variables (like `GOOGLE_GENERATIVE_AI_API_KEY`) will be declared using references to secure Cloud Secret Manager secrets (e.g. `valueFrom: secretKeyRef: ...`) or keep placeholders in the committed template with clear instructions in `DEPLOYMENT.md` to set them securely.
- **[Risk] Temporary Compilation Files Committed by Accident**
  - **[Mitigation]** The generated `service.yaml` files will be explicitly added to the root `.gitignore` file (`services/*/service.yaml`) to ensure they remain strictly untracked build targets.
