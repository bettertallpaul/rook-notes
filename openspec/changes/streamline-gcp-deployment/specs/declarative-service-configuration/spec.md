## ADDED Requirements

### Requirement: Symmetrical Declarative Manifests
All deployed container services MUST have version-controlled declarative configurations specifying container port configurations, CPU/memory limits, concurrency boundaries, and required environment mappings inside a Knative-compatible service definition file (`service.yaml`) stored inside each workspace directory.

#### Scenario: Applying declarative service configurations
- **WHEN** deploying a service using the declarative spec `service.yaml` via CLI
- **THEN** it SHALL replace the Cloud Run configuration in GCP with the exact specs defined in the manifest file
