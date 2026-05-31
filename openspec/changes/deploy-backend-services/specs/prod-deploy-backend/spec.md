## ADDED Requirements

### Requirement: Symmetrical Frontend Container Naming
The frontend production build file SHALL be named `Dockerfile.app` to match the naming scheme of the backend services (`Dockerfile.api` and `Dockerfile.mcp`).

#### Scenario: Symmetrical Dockerfile compilation
- **WHEN** building the production React/Nginx image using `-f Dockerfile.app`
- **THEN** Nginx successfully compiles and bundles the frontend static assets from the multi-stage builder.

### Requirement: Containerized Express API Build
The system SHALL support containerizing the Express API service using a `Dockerfile.api` based on `node:24-bookworm-slim` to execute the Node.js Express process in a clean, isolated, non-watch environment.

#### Scenario: Successful Node containerization
- **WHEN** building the API container image using `Dockerfile.api`
- **THEN** it generates a production-ready image executing the server via `npx tsx src/server/api.ts` directly, while skipping Playwright and ONNX downloads via `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and `ONNXRUNTIME_NODE_INSTALL=skip`.

### Requirement: Containerized MCP Server Build
The system SHALL support containerizing the MCP server using a `Dockerfile.mcp` based on `node:24-bookworm-slim` to execute the Streamable HTTP Model Context Protocol server in a clean, isolated, non-watch environment.

#### Scenario: Successful MCP containerization
- **WHEN** building the MCP container image using `Dockerfile.mcp`
- **THEN** it generates a production-ready image executing the server via `npx tsx src/server/mcp.ts` directly, while skipping Playwright and ONNX downloads via `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and `ONNXRUNTIME_NODE_INSTALL=skip`.

### Requirement: Dynamic Service Port Binding
The Express API and MCP services SHALL dynamically bind to the port defined by the `PORT` environment variable (falling back to their respective development ports if unavailable), enabling seamless hosting on serverless platforms.

#### Scenario: Dynamic port assignment
- **WHEN** the Express API or MCP service starts with the `PORT` environment variable set to `8080`
- **THEN** it successfully listens on port `8080` and binds to network address `0.0.0.0`.

### Requirement: Unbuffered Nginx Proxy for SSE
The Nginx proxy configuration template SHALL process incoming HTTP headers to disable proxy buffering and caching, and allow long-lived read timeouts, to support persistent client-side Server-Sent Events (SSE).

#### Scenario: SSE routing without buffering
- **WHEN** a client establishes a persistent SSE connection on `/api/events`
- **THEN** Nginx immediately streams the broadcast events without buffering or caching, keeping the connection active for up to 24 hours.

### Requirement: Ephemeral Playground Storage
The database module SHALL read from and write to the local file system using the directory defined in the `DATA_DIR` environment variable (defaulting to `./data`), accepting that data resets when the serverless container scales to zero.

#### Scenario: Ephemeral storage resolution
- **WHEN** the Express API starts with `DATA_DIR` set to `./data` in a serverless environment
- **THEN** it reads and writes notes locally at `./data/notes.json` without mounting external volumes.

### Requirement: Comprehensive Multi-Service Documentation
The project documentation SHALL accurately describe the production architecture and detail step-by-step build, deployment, and environment mapping workflows for all three services, explicitly documenting the ephemeral storage behavior.

#### Scenario: Documentation review and validation
- **WHEN** reviewing ARCHITECTURE.md and DEPLOYMENT.md after implementation
- **THEN** the files correctly reflect the decoupled multi-service production state, dynamic ports, Nginx SSE buffering settings, and explicit instructions about ephemeral storage state resets.
