# Project Backlog

## Now
- [ ] **Deploy Backend Services:** Package and deploy the Express API and MCP servers to Google Cloud Run, configure dynamic port bindings, resolve SSE proxy buffering in Nginx, and determine storage persistence.
- [ ] **AI Milestone 2: Chat with my Vault:** Build semantic search and RAG integration to enable natural language queries over the knowledge base. Spec's out with opsx.

## Next
- [ ] **Include noindex instructions** to prevent live instances from being indexed by search engines.
- [ ] **Refactor Label Schema (Remove redundant 'source' field):** Simplify the labels architecture by removing the legacy `source` field (which is now always `'user'`) and refactor labels to be a clean array of strings (`string[]`) across frontend, backend schemas (`schemas.ts`), store, and MCP server.
- [ ] **Automate Cloud Run Setup:** Automate the multi-service provision and deployment pipeline (using Terraform or a `gcloud` CLI script) to set up the 3 Cloud Run services, configure env variables/ports, inject dynamic URLs, and link triggers automatically, completely eliminating manual Google Cloud Console UI configuration. Run `/opsx-propose automate-cloud-run-setup` to generate the specs and implementation tasks.

## Later
- [ ] **Fix `make test` execution:** Add a `"test"` script to `package.json` so that the `make test` command successfully executes tests inside the container instead of failing with a missing script error.
- [ ] **Optimize Cloud Build triggers:** Configure `Included files` and `Ignored files` filters for each service trigger in the Google Cloud Console to prevent redundant container rebuilds when only documentation or unrelated service code changes.
- [ ] **Expand AI Evaluations:** Determine if the taxonomy evaluations need more test cases (beyond the current two synthetic cases in `dataset.json`) to thoroughly benchmark tag suggestions.
- [ ] **Integrate `make test-ai`:** Include a specific `test-ai` target in the `Makefile` and decide whether to keep LLM evaluations separate from standard core application testing (`make test`).
- [ ] **AI Milestone 3: Intelligent Deduplication:** Implement agentic workflow to proactively surface and resolve redundant note content.

## Completed

| Completion Date | Task | Notes |
| - | - | - |
| 2026-05-28 | Production Build (Frontend) | Standardized React SPA production build using dynamic Nginx proxying, and documented in DEPLOYMENT.md. |
| 2026-05-10 | AI-First Documentation & Plans | Completed migration of documentation and tasks into standardized triple-file architecture (`README`, `ARCHITECTURE`, `BACKLOG`). |
| 2026-05-04 | AI Tag Suggestion UI Polish | Iterated UX with dedicated suggestion rows, ghost input states, and distinct visual states for novel vs existing tags. |
| 2026-05-01 | Error Handling & Toast UI | Integrated `sonner` notifications globally to gracefully reflect server timeouts and user request faults. |
| 2026-04-29 | AI Auto-Taxonomy Pipeline | Installed foundational `google-generative-ai` service with `promptfoo` support and finalized the explicit opt-in activation model. |
| 2026-04-27 | API & State Broadcasting Refactor | Centralized side-effects via persistent event emitters and standardized Zod contract definitions across modules. |
| 2026-03-13 | MVP Core Application | Finalized primary frontend UX, including unified sidebar and dynamic card grid layouts. |
| 2026-03-12 | Foundations (API & MCP Server) | Initial deployment of Dockerized Node API stack and streamable-http MCP endpoint for local agent interactions. |