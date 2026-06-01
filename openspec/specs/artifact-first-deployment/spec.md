# artifact-first-deployment Specification

## Purpose
TBD - created by archiving change refactor-build-workspace. Update Purpose after archive.
## Requirements
### Requirement: Symmetrical Production Dockerfiles
Symmetrical, single-stage production Dockerfiles MUST be located within each isolated service folder (`services/frontend/Dockerfile`, `services/api/Dockerfile`, `services/mcp/Dockerfile`).

#### Scenario: Symmetrical container checks
- **WHEN** building production images locally using `make prod-build`
- **THEN** it SHALL build three distinct containers (`frontend`, `api`, and `mcp`) from their respective directory Dockerfiles

### Requirement: Subsecond Container Startup
The backend production API and MCP containers MUST boot up using the native `node` runtime engine without transpilation on-the-fly.

#### Scenario: Running production API container
- **WHEN** the production Express API container starts
- **THEN** it SHALL initialize instantly (in under 1 second) and respond to request health checks

