# Implementation Plan - Transition to Production-Grade Deployment (Google Cloud Run / Nginx)

This plan outlines the steps required to adopt a production-ready, multi-stage Docker build served via Nginx for the **rook-notes** React SPA, in alignment with your production deployment guide.

Since you are currently working against the `main` branch and using a local OrbStack development environment, the plan integrates seamlessly with your local tools and workflow (via the `Makefile`), allowing full offline validation of the production-built image before deploying it to Google Cloud Run.

---

## Architecture Overview

The production pipeline will use:
1. **Multi-Stage Dockerfile**: 
   - **Stage 1 (Build)**: Leverages `node:24-bookworm-slim` (matching your `AGENTS.md` standard) and `pnpm` to compile the TypeScript/React application into static assets inside `dist/`.
   - **Stage 2 (Nginx)**: Discards the Node environment and copies the compiled assets from `dist/` into a lightweight Alpine-based Nginx container.
2. **Dynamic Nginx Template Processing**:
   - The default Nginx Docker image has built-in support for processing `.template` files placed in `/etc/nginx/templates/` using `envsubst` at startup.
   - We will define `nginx.conf.template` to listen on a dynamic `${PORT}` (required by Cloud Run) and proxy API requests on `/api` to `${API_URL}` (to route frontend client requests to the backend service).
3. **Local Production Verification**:
   - Adds Makefile targets (`prod-build`, `prod-run`, `prod-test`, `prod-clean`, and `prod-verify`) so you can locally build, spin up, verify, and clean up the production container in a single command.

---

## User Review Required

Please review the following configuration designs. No files will be modified or created until you approve this plan.

> [!NOTE]
> We will target **Node 24** (`node:24-bookworm-slim`) as specified in your `AGENTS.md` guidelines, ensuring parity with your development container environment.

> [!IMPORTANT]
> Because your React SPA communicates with the backend Express API on `/api`, the production Nginx configuration **must** proxy these calls. We introduce an `API_URL` environment variable for Nginx to proxy `/api` requests correctly, which can point to the backend container or cloud service URL in production.

---

## Proposed Changes

### Configuration Files

#### [NEW] [Dockerfile](file:///Users/paulbernier/Developer/workspace/code/rook-notes/Dockerfile)
The production Dockerfile defines the multi-stage build.

```dockerfile
# ==========================================
# Stage 1: Build Environment
# ==========================================
FROM node:24-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

# Bypass pnpm 11+ strict dependency script block (if applicable)
ENV PNPM_CONFIG_STRICT_DEP_BUILDS=false

# Cache and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy codebase and compile assets
COPY . .
RUN pnpm run build

# ==========================================
# Stage 2: Production Nginx Server
# ==========================================
FROM nginx:alpine

# Copy built SPA assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration template (processed via envsubst at container start)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default environments for local execution/fail-safe
ENV PORT=8080
ENV API_URL=http://localhost:3001

EXPOSE 8080
```

#### [NEW] [nginx.conf.template](file:///Users/paulbernier/Developer/workspace/code/rook-notes/nginx.conf.template)
Nginx template that dynamically substitutes `$PORT` and `$API_URL` when Cloud Run or your local container starts up.

```nginx
server {
    listen ${PORT};
    server_name localhost;

    # Serve built SPA assets
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy frontend API requests to the backend server
    location /api {
        proxy_pass ${API_URL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Makefile Automation

#### [MODIFY] [Makefile](file:///Users/paulbernier/Developer/workspace/code/rook-notes/Makefile)
Adding local testing targets for the production container.

```makefile
# Add at the end of the Makefile or in alphabetical order:

.PHONY: prod-build prod-run prod-test prod-clean prod-verify

prod-build: ## Build the production image locally
	docker build -t rook-notes:prod -f Dockerfile .

prod-run: ## Run production Nginx container locally (mapped to port 8080)
	docker run -d \
		--name rook-notes-prod \
		-p 8080:8080 \
		-e PORT=8080 \
		-e API_URL=http://host.docker.internal:3001 \
		--add-host=host.docker.internal:host-gateway \
		rook-notes:prod
	@printf "\n\033[1;32mProduction container running locally at http://localhost:8080\033[0m\n"

prod-test: ## Test that the production container is up and serving pages
	curl -I http://localhost:8080

prod-clean: ## Stop and remove the test production container
	docker rm -f rook-notes-prod || true
	@printf "\n\033[1;33mProduction container cleaned up successfully!\033[0m\n"

prod-verify: ## Automate: Build, run, test, and clean up the production setup
	@$(MAKE) prod-clean
	@$(MAKE) prod-build
	@$(MAKE) prod-run
	@echo "Waiting for production container Nginx to become active..."
	@sleep 2
	@$(MAKE) prod-test
	@$(MAKE) prod-clean
	@printf "\n\033[1;32mLocal production validation passed successfully!\033[0m\n"
```

---

## Verification Plan

Once approved, we will test the changes locally using the following verification plan.

### Automated Local Verification
We will execute the newly added `make prod-verify` target, which:
1. Stops any existing production test container (if any).
2. Performs the multi-stage Docker build to create the `rook-notes:prod` image.
3. Spins up the container locally in the background.
4. Uses `curl` to verify that Nginx responds with `HTTP/1.1 200 OK`.
5. Cleans up the running test container automatically.

### Manual Verification
1. Spin up the backend API container using `make up` (so it runs at `http://localhost:3001`).
2. Run `make prod-run` to spin up the production frontend container.
3. Open `http://localhost:8080` in your web browser.
4. Interact with the application to verify that it successfully retrieves and updates notes (validating that the Nginx `/api` proxy works flawlessly with the API container).
