.PHONY: help up shell install dev build test down purge seed fresh design-lint design-diff design-export design-spec prod-build prod-run prod-clean prod-verify prod-api-build prod-mcp-build prod-api-run prod-mcp-run prod-backend-clean prod-backend-verify prod-app-build prod-app-run prod-app-test prod-app-clean prod-app-verify gcp-auth-check prod-release-api prod-release-mcp prod-release-frontend prod-release-all prod-urls

.DEFAULT_GOAL := help

# Load environment variables from .env if it exists
ifneq (,$(wildcard .env))
    include .env
    export $(shell grep -E '^[A-Za-z0-9_]+=' .env | cut -d= -f1)
endif

# ==========================================
# --- GCP DEPLOYMENT CONFIGURATION ---
# ==========================================
GCP_PROJECT ?=
GCP_REGION ?=
REGISTRY ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/rook-notes
TIMESTAMP = $(shell date +%s)

# ==========================================
# --- HELP / UTILITIES ---
# ==========================================

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==========================================
# --- DEVELOPMENT WORKFLOW ---
# ==========================================

up: ## Start containers in the background
	docker compose up -d --build
	@printf "\n\033[1;32mServices started successfully!\033[0m\n"
	@printf "\033[1mURLs:\033[0m\n"
	@printf "   App (Frontend):   \033[4;36mhttp://rook-notes.local\033[0m   (or http://localhost:5173)\n"
	@printf "   API (Backend):     \033[4;36mhttp://api.rook-notes.local\033[0m   (or http://localhost:3001)\n"
	@printf "   MCP Server:       \033[4;36mhttp://mcp.rook-notes.local\033[0m   (or http://localhost:3002)\n\n"

shell: ## Open a bash shell in the app container
	docker compose exec app bash

install: ## Install pnpm dependencies
	docker compose exec app pnpm install

dev: ## Start containers in the foreground
	@printf "\n\033[1;32mStarting services in the foreground...\033[0m\n"
	@printf "\033[1mURLs:\033[0m\n"
	@printf "   App (Frontend):   \033[4;36mhttp://rook-notes.local\033[0m   (or http://localhost:5173)\n"
	@printf "   API (Backend):     \033[4;36mhttp://api.rook-notes.local\033[0m   (or http://localhost:3001)\n"
	@printf "   MCP Server:       \033[4;36mhttp://mcp.rook-notes.local\033[0m   (or http://localhost:3002)\n\n"
	docker compose up

build: ## Build the app
	docker compose run --rm app pnpm run build

test: ## Run tests
	docker compose exec app pnpm test

down: ## Stop containers
	docker compose down

purge: ## Stop containers and remove volumes, images, and node_modules
	docker compose down --volumes --rmi local --remove-orphans
	docker volume prune -f
	rm -rf node_modules

fresh: purge up ## Purge and restart, then seed data
	@echo "Waiting for API to be ready..."
	@until curl -s http://localhost:3001/api/notes > /dev/null 2>&1; do sleep 1; done
	@$(MAKE) seed

# ==========================================
# --- DATABASE / SEEDING ---
# ==========================================

seed: ## Run the seed script
	./scripts/seed.sh

# ==========================================
# --- DESIGN SYSTEM TOOLS ---
# ==========================================

design-lint: ## Validate DESIGN.md structure
	docker compose exec app pnpm run design:lint

design-diff: ## Compare DESIGN.md against another file (Usage: make design-diff file=v2.md)
	@if [ -z "$(file)" ]; then echo "Usage: make design-diff file=DESIGN-v2.md"; exit 1; fi
	docker compose exec app npx @google/design.md diff DESIGN.md $(file)

design-export: ## Export DESIGN.md tokens (Usage: make design-export format=tailwind)
	@if [ -z "$(format)" ]; then echo "Usage: make design-export format=<tailwind|dtcg>"; exit 1; fi
	docker compose exec app npx @google/design.md export --format $(format) DESIGN.md

design-spec: ## Output the DESIGN.md format specification
	docker compose exec app npx @google/design.md spec

# ==========================================
# --- PRODUCTION VERIFICATION ---
# ==========================================

# --- Individual Service Builds ---
prod-app-build: ## Build the production Frontend Docker image
	docker build -t rook-notes:prod -f services/frontend/Dockerfile .

prod-api-build: ## Build the production API Docker image
	docker build -t rook-notes-api:prod -f services/api/Dockerfile .

prod-mcp-build: ## Build the production MCP Docker image
	docker build -t rook-notes-mcp:prod -f services/mcp/Dockerfile .

prod-build: build prod-app-build prod-api-build prod-mcp-build ## Build all production Docker images (Frontend, API, MCP)

prod-port-check: ## Check if development containers are occupying production ports
	@if docker ps --format '{{.Names}}' | grep -E "rook-notes-(app|api|mcp)-1" >/dev/null 2>&1; then \
		printf "\n\033[1;31mError: Your local development environment is still running!\033[0m\n"; \
		printf "Active dev containers are currently occupying ports 3001/3002.\n"; \
		printf "Please stand them down first by running:\n"; \
		printf "  \033[1;36mmake down\033[0m\n\n"; \
		exit 1; \
	fi

# --- Individual Service Lifecycle ---
prod-app-run: prod-port-check ## Run the production Frontend container locally in the background
	docker run -d --name rook-notes-prod -p 8080:8080 -e PORT=8080 -e API_URL=http://host.docker.internal:3001 --add-host=host.docker.internal:host-gateway rook-notes:prod
	@printf "\nProduction Frontend started at http://localhost:8080\n"

prod-api-run: prod-port-check ## Run the production API container locally in the background
	docker run -d --name rook-notes-api-prod -p 3001:3001 -e PORT=3001 --env-file .env -v $(shell pwd)/data:/app/data rook-notes-api:prod

prod-mcp-run: prod-port-check ## Run the production MCP container locally in the background
	docker run -d --name rook-notes-mcp-prod -p 3002:3002 -e PORT=3002 -e API_BASE_URL=http://host.docker.internal:3001 --add-host=host.docker.internal:host-gateway rook-notes-mcp:prod

prod-run: prod-api-run prod-mcp-run prod-app-run ## Run all production containers locally in the background

# --- Individual Service Cleans ---
prod-app-clean: ## Stop and remove the production Frontend container
	-docker stop rook-notes-prod
	-docker rm rook-notes-prod

prod-backend-clean: ## Stop and remove production backend containers (API, MCP)
	-docker stop rook-notes-api-prod rook-notes-mcp-prod
	-docker rm rook-notes-api-prod rook-notes-mcp-prod

prod-clean: prod-app-clean prod-backend-clean ## Stop and remove all production containers

# --- Individual Service Tests & Verification ---
prod-app-test: ## Test the production Frontend container endpoint
	@printf "\nTesting production Frontend container endpoint...\n"
	@curl -f http://localhost:8080/ || (echo "Failed to contact production Frontend container!" && exit 1)
	@printf "Production Frontend container test passed!\n"

prod-app-verify: prod-app-clean prod-app-build prod-app-run ## Run the Frontend build-run-test production verification pipeline
	@printf "\nWaiting for production Frontend server to be ready...\n"
	@sleep 2
	@$(MAKE) prod-app-test
	@$(MAKE) prod-app-clean
	@printf "\nProduction Frontend verification completed successfully!\n"

prod-backend-verify: prod-backend-clean prod-api-build prod-mcp-build prod-api-run prod-mcp-run ## Build, run, and verify the production backend containers
	@printf "\nWaiting for production backend services to start...\n"
	@sleep 3
	@printf "\nTesting API container endpoint...\n"
	@curl -f http://localhost:3001/api/notes || (echo "Failed to contact production API container!" && $(MAKE) prod-backend-clean && exit 1)
	@printf "API container test passed!\n"
	@printf "\nTesting MCP container endpoint...\n"
	@curl -s http://localhost:3002/mcp | grep "Method not allowed" > /dev/null || (echo "Failed to contact production MCP container!" && $(MAKE) prod-backend-clean && exit 1)
	@printf "MCP container test passed!\n"
	@$(MAKE) prod-backend-clean
	@printf "\nProduction backend verification completed successfully!\n"

# --- Orchestrated Full Pipeline Verification ---
prod-verify: prod-clean prod-build prod-run ## Run the full build-run-test production verification pipeline for all services
	@printf "\nWaiting for all production services to start...\n"
	@sleep 3
	@printf "\nTesting production Frontend container endpoint...\n"
	@curl -f http://localhost:8080/ || (echo "Failed to contact production Frontend container!" && $(MAKE) prod-clean && exit 1)
	@printf "Frontend container test passed!\n"
	@printf "\nTesting production API container endpoint...\n"
	@curl -f http://localhost:3001/api/notes || (echo "Failed to contact production API container!" && $(MAKE) prod-clean && exit 1)
	@printf "API container test passed!\n"
	@printf "\nTesting production MCP container endpoint...\n"
	@curl -s http://localhost:3002/mcp | grep "Method not allowed" > /dev/null || (echo "Failed to contact production MCP container!" && $(MAKE) prod-clean && exit 1)
	@printf "MCP container test passed!\n"
	@$(MAKE) prod-clean
	@printf "\nFull multi-service production verification pipeline completed successfully!\n"

# ==========================================
# --- GCP PRODUCTION RELEASE PIPELINE ---
# ==========================================

gcp-auth-check: ## Verify that gcloud is authenticated and project is set correctly
	@if [ "$$(gcloud config get-value project 2>/dev/null)" != "$(GCP_PROJECT)" ]; then \
		echo "Error: Active gcloud project must be set to $(GCP_PROJECT)"; \
		exit 1; \
	fi
	@gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep . >/dev/null || (echo "Error: Not authenticated with gcloud. Run 'gcloud auth login'" && exit 1)

prod-release-api: gcp-auth-check build ## Build, push and deploy production API service
	@printf "\nBuilding production API container...\n"
	docker build --platform linux/amd64 -t $(REGISTRY)/api:latest -f services/api/Dockerfile .
	@printf "Pushing API image to Artifact Registry...\n"
	docker push $(REGISTRY)/api:latest
	@printf "Compiling declarative service definition...\n"
	sed -e "s|GCP_REGION_PLACEHOLDER|$(GCP_REGION)|g" \
	    -e "s|REGISTRY_PLACEHOLDER|$(REGISTRY)|g" \
	    -e "s|DEPLOY_TIMESTAMP_PLACEHOLDER|$(TIMESTAMP)|g" \
	    services/api/service.template.yaml > services/api/service.yaml
	@printf "Deploying API service to Cloud Run...\n"
	gcloud run services replace services/api/service.yaml --platform managed --region $(GCP_REGION)
	@printf "Enabling public unauthenticated access...\n"
	gcloud run services add-iam-policy-binding rook-notes-api --member="allUsers" --role="roles/run.invoker" --platform managed --region $(GCP_REGION) --quiet

prod-release-mcp: gcp-auth-check build ## Build, push and deploy production MCP service
	@printf "\nDiscovering live API URL...\n"
	@API_URL=$$(gcloud run services describe rook-notes-api --platform managed --region $(GCP_REGION) --format="value(status.url)"); \
	if [ -z "$$API_URL" ]; then echo "Error: Could not retrieve API service URL." && exit 1; fi; \
	printf "API live URL discovered: $$API_URL\n"; \
	printf "Building production MCP container...\n"; \
	docker build --platform linux/amd64 -t $(REGISTRY)/mcp:latest -f services/mcp/Dockerfile .; \
	printf "Pushing MCP image to Artifact Registry...\n"; \
	docker push $(REGISTRY)/mcp:latest; \
	printf "Compiling declarative service definition...\n"; \
	sed -e "s|GCP_REGION_PLACEHOLDER|$(GCP_REGION)|g" \
	    -e "s|REGISTRY_PLACEHOLDER|$(REGISTRY)|g" \
	    -e "s|DEPLOY_TIMESTAMP_PLACEHOLDER|$(TIMESTAMP)|g" \
	    -e "s|API_BASE_URL_PLACEHOLDER|$$API_URL|g" \
	    services/mcp/service.template.yaml > services/mcp/service.yaml; \
	printf "Deploying MCP service to Cloud Run...\n"; \
	gcloud run services replace services/mcp/service.yaml --platform managed --region $(GCP_REGION)
	@printf "Enabling public unauthenticated access...\n"
	gcloud run services add-iam-policy-binding rook-notes-mcp --member="allUsers" --role="roles/run.invoker" --platform managed --region $(GCP_REGION) --quiet

prod-release-frontend: gcp-auth-check build ## Build, push and deploy production Frontend service
	@printf "\nDiscovering live API URL...\n"
	@API_URL=$$(gcloud run services describe rook-notes-api --platform managed --region $(GCP_REGION) --format="value(status.url)"); \
	if [ -z "$$API_URL" ]; then echo "Error: Could not retrieve API service URL." && exit 1; fi; \
	printf "API live URL discovered: $$API_URL\n"; \
	printf "Building production Frontend container...\n"; \
	docker build --platform linux/amd64 -t $(REGISTRY)/frontend:latest -f services/frontend/Dockerfile .; \
	printf "Pushing Frontend image to Artifact Registry...\n"; \
	docker push $(REGISTRY)/frontend:latest; \
	printf "Compiling declarative service definition...\n"; \
	sed -e "s|GCP_REGION_PLACEHOLDER|$(GCP_REGION)|g" \
	    -e "s|REGISTRY_PLACEHOLDER|$(REGISTRY)|g" \
	    -e "s|DEPLOY_TIMESTAMP_PLACEHOLDER|$(TIMESTAMP)|g" \
	    -e "s|API_URL_PLACEHOLDER|$$API_URL|g" \
	    services/frontend/service.template.yaml > services/frontend/service.yaml; \
	printf "Deploying Frontend service to Cloud Run...\n"; \
	gcloud run services replace services/frontend/service.yaml --platform managed --region $(GCP_REGION)
	@printf "Enabling public unauthenticated access...\n"
	gcloud run services add-iam-policy-binding rook-notes-frontend --member="allUsers" --role="roles/run.invoker" --platform managed --region $(GCP_REGION) --quiet

prod-release-all: prod-release-api prod-release-mcp prod-release-frontend ## Release all services in order (API -> MCP & Frontend)
	@printf "\nAll services deployed successfully!\n"
	@$(MAKE) prod-urls

prod-urls: gcp-auth-check ## Print the live production URLs of all deployed services on Google Cloud Run
	@printf "\n\033[1;32mActive Production URLs in project '$(GCP_PROJECT)' (%s):\033[0m\n" "$(GCP_REGION)"
	@printf "  App (Frontend):   \033[4;36m%s\033[0m\n" $$(gcloud run services describe rook-notes-frontend --platform managed --region $(GCP_REGION) --format="value(status.url)" 2>/dev/null || echo "Not Deployed")
	@printf "  API (Backend):     \033[4;36m%s\033[0m\n" $$(gcloud run services describe rook-notes-api --platform managed --region $(GCP_REGION) --format="value(status.url)" 2>/dev/null || echo "Not Deployed")
	@printf "  MCP Server:       \033[4;36m%s\033[0m\n\n" $$(gcloud run services describe rook-notes-mcp --platform managed --region $(GCP_REGION) --format="value(status.url)" 2>/dev/null || echo "Not Deployed")

