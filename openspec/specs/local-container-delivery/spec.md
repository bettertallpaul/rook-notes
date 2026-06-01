# local-container-delivery Specification

## Purpose
TBD - created by archiving change streamline-gcp-deployment.

## Requirements

### Requirement: Local Container Build and Registry Push
The system MUST compile the source code, build the production container images inside the local development host's Docker engine, and push the compiled images directly to Google Artifact Registry without passing through remote GitHub-triggered Cloud Build pipelines.

#### Scenario: Building and pushing container images
- **WHEN** running the command `make prod-release-api` in the local shell
- **THEN** it SHALL compile the API service, build the production image `api:latest` using local artifacts, and push it directly to GCP Artifact Registry
