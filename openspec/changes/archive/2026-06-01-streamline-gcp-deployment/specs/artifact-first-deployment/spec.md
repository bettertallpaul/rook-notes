## MODIFIED Requirements

### Requirement: Symmetrical Production Dockerfiles
Symmetrical, single-stage production Dockerfiles MUST be located within each isolated service folder (`services/frontend/Dockerfile`, `services/api/Dockerfile`, `services/mcp/Dockerfile`) and MUST be built locally using local pre-compiled bundles to bypass the gitignored build output limitation of remote GitHub-triggered pipelines.

#### Scenario: Symmetrical container checks
- **WHEN** building production images locally using `make prod-build` or release targets
- **THEN** it SHALL compile the workspaces and build three distinct containers (`frontend`, `api`, and `mcp`) from their respective directory Dockerfiles on the local engine
