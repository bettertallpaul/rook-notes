## ADDED Requirements

### Requirement: Production Dockerfile Builder Stage
The build process SHALL utilize a multi-stage Docker build. The builder stage SHALL use `node:24-bookworm-slim` as its base image and install project dependencies using `pnpm` under a cached store before running the compile script.

#### Scenario: Multi-stage builder runs pnpm build
- **WHEN** the production Docker image is built using `docker build`
- **THEN** the builder stage successfully installs all dependencies and compiles the React SPA assets into the `dist/` directory

### Requirement: Production Nginx Runner Stage
The runner stage of the production Docker build SHALL be based on the `nginx:alpine` image. It SHALL copy the compiled static assets from the builder stage into Nginx's public web directory and mount the Nginx configuration template into Nginx's template folder for environment substitution.

#### Scenario: Runner stage initialization
- **WHEN** the Docker runner stage starts up
- **THEN** it serves the static React assets and prepares the `/etc/nginx/templates/default.conf.template` file for configuration processing

### Requirement: Dynamic Port and API Routing
The Nginx configuration template SHALL dynamically bind the HTTP server to the port specified in the `PORT` environment variable and SHALL proxy all incoming client requests on the `/api` prefix to the backend URL specified in the `API_URL` environment variable.

#### Scenario: Running container with port and proxy variables
- **WHEN** the production container starts with `PORT=8080` and `API_URL=http://localhost:3001`
- **THEN** the server binds to port 8080 and successfully forwards all HTTP requests to `/api/*` to `http://localhost:3001/api/*`

### Requirement: Makefile Production Automation
The project `Makefile` SHALL provide target tasks for automated local DevOps operations: building the production image, running the production container, testing the container endpoint, cleaning up the container resources, and running a complete build-run-test-clean verification pipeline.

#### Scenario: Makefile production verification pipeline
- **WHEN** the user executes `make prod-verify` on the host machine
- **THEN** the target builds the production Docker image, starts the container, validates server readiness, and removes the container without leaving orphaned resources

### Requirement: Makefile Categorized Organization
The project `Makefile` SHALL be organized logically into clear, commented sections to distinguish between helper commands, local development setup, database/seeding operations, design system tools, and production validation tasks.

#### Scenario: Makefile contains structural sections
- **WHEN** the `Makefile` is read or queried via the help target
- **THEN** it displays all targets organized cleanly under their respective logical header groups

### Requirement: Deployment Documentation (DEPLOYMENT.md)
The project root SHALL contain a `DEPLOYMENT.md` markdown file documenting the architectural overview, local production container testing, step-by-step console instructions for Google Cloud Run deployment, and operational gotchas.

#### Scenario: User references DEPLOYMENT.md
- **WHEN** the user opens `DEPLOYMENT.md` in the project root
- **THEN** they are presented with detailed, succinct instructions to verify the production build locally and deploy the React SPA via the Google Cloud Console.

### Requirement: Branching Workflow Transition Instructions
The project SHALL include clear git branching transition steps inside its tasks and documentation, providing a one-off workflow to move development off the `main` branch to a new `dev` branch using either the Command Line Interface (CLI) or the Google Antigravity IDE graphical user interface (GUI).

#### Scenario: Initializing the dev branch transition
- **WHEN** the user executes the transition instructions using either CLI commands or Antigravity IDE GUI actions
- **THEN** the local and remote repositories successfully establish a `dev` branch where all subsequent features/bugfixes are implemented.



