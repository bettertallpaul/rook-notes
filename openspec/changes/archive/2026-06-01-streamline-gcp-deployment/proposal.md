## Why

The current deployment strategy relies on Google Cloud Build triggers executing single-stage Dockerfiles directly from a remote GitHub clone. Because these optimized production Dockerfiles copy pre-compiled, gitignored build outputs (`dist/`) created locally, remote cloud builds immediately fail unless compiled artifacts are actively committed directly to source control, which causes repository bloat, pull request pollution, and persistent merge conflicts.

## What Changes

- **[NEW]** Symmetrical, native Knative-compatible declarative service files (`service.yaml`) for each of the three services (`services/api/service.yaml`, `services/mcp/service.yaml`, `services/frontend/service.yaml`) specifying port mappings, environment keys, concurrency, and resource constraints.
- **[NEW]** Automated, unified release targets inside the root `Makefile` (`prod-release-api`, `prod-release-mcp`, `prod-release-frontend`, `prod-release-all`) to compile TypeScript source, build Docker images locally, push them directly to Google Artifact Registry, and apply declarative specs in Cloud Run.
- **[MODIFY]** Purge Section 3 (GitHub PR-triggered workflow) and Section 4 (web UI Cloud Build trigger config setup) of the `DEPLOYMENT.md` guide.
- **[MODIFY]** Replace legacy web UI setup documentation in `DEPLOYMENT.md` with terminal-driven local container packaging and declarative deployment instructions.
- **[REMOVE]** Google Cloud Build web console trigger configurations and GitHub remote repository watch rules.

## Capabilities

### New Capabilities
- `local-container-delivery`: Packaging compiled workspace code inside the local Docker engine and pushing finished images directly to GCP Artifact Registry, keeping gitignored `dist/` folders clean of source control.
- `declarative-service-configuration`: Specifying container ports, resource boundaries, environment keys, and concurrency limits via Knative-compatible declarative YAML templates for direct application to Google Cloud Run.

### Modified Capabilities
- `artifact-first-deployment`: The deployment paradigm is modified to bypass remote GitHub-triggered Cloud Build runners in favor of immediate local terminal-based image pushing and config replacing.

## Impact

- **Build / Release System (`Makefile`)**: Multi-service build-and-push orchestration is integrated directly into the `Makefile`.
- **Workspace Architecture**: `service.yaml` manifests are co-located in `services/api`, `services/mcp`, and `services/frontend`.
- **Infrastructure Overhead**: Replaces Cloud Build triggers and manual browser-based environment configuration with deterministic, versioned configuration files that can be edited inside the IDE.
- **Documentation (`DEPLOYMENT.md`)**: Totally rewritten to represent the CLI-first and declarative-first cloud lifecycle.
