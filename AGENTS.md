## Docker-First Dev Runtime (macOS \+ OrbStack)

Assume projects run inside containers by default.

- Prefer `docker compose` workflows over host tooling for app commands.  
- Do not run `npm`, `pnpm`, `node`, `python`, or `pip` on host unless explicitly requested.  
- For new repos, scaffold and maintain:  
  - `Dockerfile.dev`  
  - `docker-compose.yml`  
  - `Makefile` with: `up`, `shell`, `install`, `dev`, `build`, `test`, `down`  
- Use `node:24-bookworm-slim` \+ Corepack/pnpm for Node projects.  
- Keep source bind-mounted, and use named volumes for `node_modules` and package caches.  
- Bind dev servers to `0.0.0.0` inside container and publish ports in Compose.  
- Prefer ARM-native images on Apple Silicon; only force `linux/amd64` when required by dependencies.  
- When troubleshooting, check in order:  
  1. `docker context ls`
  2. `docker compose ps`  
  3. `docker compose logs --tail=200 <service>`  
  4. rebuild/restart: `docker compose down && docker compose up -d --build`