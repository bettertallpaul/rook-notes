# Engineering Context Capsule: AI Integrations

This document bridges the AI Integrations PRD and the technical Implementation Plans. It outlines the specific architectural decisions, schema modifications, and data flow strategy. As milestones are completed, decisions are moved from "Open Architecture Questions" to "Resolved Architectural Decisions".

**Current State Constraint:** The system relies on a single source of truth (`data/notes.json`), an Express API with SSE, and a React/Zustand frontend—all running in Docker. The introduction of LLMs, background jobs, and vector storage introduces state management complexities.

---

### TODOS
1. Polish UI for AI suggested tags. Doesn't match the mock.
2. Flesh out evals: currently only two test cases? Need to add `test-ai` or similar in makefile. Also check if current `make test` is up to date. Should it be split in core app vs AI features?

---

## Resolved Architectural Decisions

### Milestone 1: Auto-Taxonomy (Completed Phases 1 & 2)
- **Data Model Extension (Schema):** Changed the `labels` array from `string[]` to an array of objects `[{ name: string, source: "user" | "ai_auto" | "ai_suggested" }]` to drive UI logic without parallel arrays.
- **Async Job Durability:** Decided to rely on a lightweight Node.js Task Manager for floating promises within the Express API for M1, accepting that jobs may be lost on container restart. A robust queue (SQLite outbox) is deferred to M3.
- **Context Window Protection:** Implemented hard truncation at ~20,000 characters for the LLM prompt to prevent context exhaustion on massive notes.
- **Tag Bloat Resiliency:** To prevent bloating context with hundreds of existing tags, implemented a fast Tag Pre-filtering mechanism using basic keyword/substring matching. (Note: Currently conservative; e.g., "test" in content won't nudge a "testing" tag).

---

## Open Architecture Questions (For Future Milestones)

### 1. Data Model & Schema Extensions (`src/shared/schemas.ts`)
- **Consolidating Zod Schemas:** Currently, schemas are split between `shared/schemas.ts` (Core/DTO) and local "locality-based" definitions (e.g., `TaxonomySchema` in `taxonomy.ts`). As more AI features (M2, M3) are added, should we consolidate all Zod validation into a domain-driven structure (e.g., `src/shared/schemas/ai.ts`) to ensure reusability between the application logic and evaluation suites?
- **Storing Merge Proposals (M3):** The Deduplication Agent requires human-in-the-loop approval before merging notes. How is the LLM's proposed merge stored? Does `NoteSchema` gain a `status: "draft"` field and `mergedFromIds: string[]`, or do we create a separate `MergeProposalSchema` that does not touch `notes.json` until approved?

### 2. Background Job & State Architecture
- **Vector Sync Guarantee (M2):** The system must maintain parity between `data/notes.json` and Weaviate. How are Weaviate updates triggered reliably? Does `store.ts` emit an internal Node event on every CRUD operation? What is the reconciliation strategy if the vector upsert fails but the JSON save succeeds?
- **Worker Container vs. API Process (M3):** M3 requires a scheduled batch job. Does this heavy agentic workload run inside the existing `api` Docker container using `node-cron`, or do we introduce a dedicated `worker` service in `docker-compose.yml` to isolate compute?

### 3. Scale, API & Data Flow Strategy
- **Streaming RAG Responses (M2):** The UI needs to stream the AI's response for the chat feature. Do we broadcast the streaming text chunks over the existing `/api/events` SSE connection, or do we create a dedicated streaming HTTP endpoint specifically leveraging Vercel AI SDK?
- **Semantic Taxonomy (M2):** Once the vector store is live, we plan to replace the current keyword-based tag pre-filtering with a semantic similarity search. This will allow the AI to be nudged with relevant existing tags even if they don't appear as literal substrings (e.g., "test" in content nudging a "testing" tag).
### 4. Model Selection & Stability
- **Switch to 2.5-flash-lite:** Default model updated to `gemini-2.5-flash-lite` in `schemas.ts` as 1.5 models are deprecated/unavailable for the primary dev account.
- **Research Needed (2.0 Lite):** Research why the `2.0 lite` model failed during initial testing. Investigate if it offers better rate limits or latency than 2.5-flash-lite once connectivity issues are resolved.
