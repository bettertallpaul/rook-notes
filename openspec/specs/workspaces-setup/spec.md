# workspaces-setup Specification

## Purpose
TBD - created by archiving change refactor-build-workspace. Update Purpose after archive.
## Requirements
### Requirement: Workspace Isolation
The codebase SHALL be partitioned into discrete, independent npm packages inside a top-level `services/` directory.

#### Scenario: Isolated dependency graphs
- **WHEN** checking dependencies in `services/frontend/package.json`
- **THEN** it must only declare frontend-specific libraries and not contain backend packages like Express

### Requirement: Shared Schema Dependency resolution
The other service packages (frontend, api, mcp) SHALL resolve the Zod schemas and types package (`@rook/shared`) directly via native `pnpm workspaces` symlinking.

#### Scenario: Importing schemas across packages
- **WHEN** importing schemas inside `services/api/src/api.ts`
- **THEN** the import SHALL reference the `@rook/shared` package without relative file path backtracking

