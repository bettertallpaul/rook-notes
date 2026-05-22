.PHONY: help up shell install dev build test down purge seed fresh design-lint design-diff design-export design-spec

.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

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
	docker compose exec app pnpm run build

test: ## Run tests
	docker compose exec app pnpm test

down: ## Stop containers
	docker compose down

purge: ## Stop containers and remove volumes, images, and node_modules
	docker compose down --volumes --rmi local --remove-orphans
	docker volume prune -f
	rm -rf node_modules

seed: ## Run the seed script
	./scripts/seed.sh

fresh: purge up ## Purge and restart, then seed data
	@echo "Waiting for API to be ready..."
	@until curl -s http://localhost:3001/api/notes > /dev/null 2>&1; do sleep 1; done
	@$(MAKE) seed

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
