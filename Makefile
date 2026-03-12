.PHONY: up shell install dev build test down purge seed fresh

up:
	docker compose up -d --build

shell:
	docker compose exec app bash

install:
	docker compose exec app npm install

dev:
	docker compose up

build:
	docker compose exec app npm run build

test:
	docker compose exec app npm test

down:
	docker compose down

purge:
	docker compose down --volumes --rmi local

seed:
	./scripts/seed.sh

fresh: purge up
	@echo "Waiting for API to be ready..."
	@until curl -s http://localhost:3001/api/notes > /dev/null 2>&1; do sleep 1; done
	@$(MAKE) seed
