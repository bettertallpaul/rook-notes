# precompiled-bundling Specification

## Purpose
TBD - created by archiving change refactor-build-workspace. Update Purpose after archive.
## Requirements
### Requirement: Local Codebase Precompilation
The API backend, MCP server, and frontend assets MUST be compiled inside the development container environment prior to production packaging.

#### Scenario: Running build command
- **WHEN** the command `make build` is executed inside the repository
- **THEN** it SHALL compile the shared package, bundle backend services, and compile frontend static assets locally in their respective `dist/` directories

### Requirement: Standalone Backend Bundles
The API and MCP server compilation step MUST bundle their respective source files and internal imports into a single, self-contained ESM JavaScript module file.

#### Scenario: Inspecting build artifact
- **WHEN** checking the output of the compilation process for `services/api`
- **THEN** a single ESM file `services/api/dist/index.js` SHALL exist containing all bundled libraries and logic

