## 1. Local CLI Pre-requisites & Setup

- [ ] 1.1 Install Google Cloud SDK (`google-cloud-sdk`) on the host Mac via Homebrew (`brew install --cask google-cloud-sdk`)
- [ ] 1.2 Authenticate the local gcloud CLI using interactive OAuth (`gcloud auth login`) and set the active production project
- [ ] 1.3 Configure the local Docker engine credential helper for secure Google Artifact Registry communication (`gcloud auth configure-docker`)
- [ ] 1.4 Append generated Knative service manifests (`services/*/service.yaml`) to the repository root `.gitignore` to prevent tracking of dynamic deployment targets
- [ ] 1.5 Optimize the repository root `.dockerignore` file, ignoring raw `src/` directories, `node_modules`, and local development databases (`data/`) to speed up local OrbStack build context transfer rates

## 2. Declarative Service Templates & Dockerfile Refactoring

- [ ] 2.1 Create `services/api/service.template.yaml` specifying container port `3001`, resource limits, environment variables, and the `DEPLOY_TIMESTAMP_PLACEHOLDER` annotation to bypass the Cloud Run revision cache trap
- [ ] 2.2 Create `services/mcp/service.template.yaml` specifying container port `3002`, resource limits, `API_BASE_URL_PLACEHOLDER` downstream routing key, and the dynamic deploy-timestamp annotation
- [ ] 2.3 Create `services/frontend/service.template.yaml` specifying container port `80`, resource limits, Nginx upstream `API_URL_PLACEHOLDER` downstream routing key, and the dynamic deploy-timestamp annotation
- [ ] 2.4 Refactor `services/api/Dockerfile` to standardize copying `services/api/dist/index.js` relative to the repository root `.` build context
- [ ] 2.5 Refactor `services/mcp/Dockerfile` to standardize copying `services/mcp/dist/index.js` relative to the repository root `.` build context
- [ ] 2.6 Refactor `services/frontend/Dockerfile` to standardize copying `services/frontend/nginx.conf.template` and compiled static files `services/frontend/dist` relative to the repository root `.` build context

## 3. Makefile Upgrades & Release Integration

- [ ] 3.1 Integrate GCP configuration environment variables (`GCP_PROJECT`, `GCP_REGION`, `REGISTRY`) and a dynamic seconds timestamp (`TIMESTAMP = $(shell date +%s)`) inside the root `Makefile`
- [ ] 3.2 Implement `gcp-auth-check` pre-flight target checking active `gcloud` project authentication
- [ ] 3.3 Implement `prod-release-api` target executing `pnpm build`, local container packaging using root-relative path contexts (`docker build -f services/api/Dockerfile .`), registry push, `sed` placeholder replacement, and Knative `service.yaml` replacement
- [ ] 3.4 Implement `prod-release-mcp` target using `gcloud run services describe rook-notes-api` to discover the live URL, compile `service.yaml` via `sed`, build, push, and replace
- [ ] 3.5 Implement `prod-release-frontend` target using `gcloud run services describe rook-notes-api` to discover the live URL, compile `service.yaml` via `sed`, build, push, and replace
- [ ] 3.6 Implement unified orchestrator target `prod-release-all` to chain all three service updates in correct order (API -> MCP & Frontend)

## 4. Documentation Alignment & Guide Updates

- [ ] 4.1 Refactor `DEPLOYMENT.md` by completely deleting legacy Section 3 (Git Pollution / GitHub PR trigger release instructions) and Section 4 (Web UI console trigger setup)
- [ ] 4.2 Update `DEPLOYMENT.md` with comprehensive, CLI-first documentation, explicitly detailing the two release workflows: **Path A (Standard Production Release from `main`)** and **Path B (Instant Staging Deployment from feature branches)**
- [ ] 4.3 Update `ARCHITECTURE.md` to reflect `service.template.yaml` file additions in the project structure diagram and document the local-packaging-remote-deploy pipeline in Section 6


