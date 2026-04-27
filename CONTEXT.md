# Engineering Context Capsule: AI Integrations

This document bridges the AI Integrations PRD and the upcoming technical Implementation Plan. It outlines the specific architectural decisions, schema modifications, and data flow questions that engineering must explicitly resolve before writing any code.

**Current State Constraint:** The system relies on a single source of truth (`data/notes.json`), an Express API with SSE, and a React/Zustand frontend—all running in Docker. The introduction of LLMs, background jobs, and vector storage introduces new state management complexities that must be accounted for.

## 1. Data Model & Schema Extensions (`src/shared/schemas.ts`)
Because Zod schemas drive the application, the PRD’s UX requirements dictate specific structural changes to `NoteSchema`:
- **Differentiating AI vs. User Tags (M1):** The UI requires a "subtle visual cue" for AI-applied tags. Do we change the `labels` array from `string[]` to an array of objects `[{ name: string, source: "user" | "ai" }]`? Or do we introduce a parallel array `aiSuggestedLabels: string[]`?
- **Storing Merge Proposals (M3):** The Deduplication Agent requires human-in-the-loop approval before merging notes. How is the LLM's proposed merge stored? Does `NoteSchema` gain a `status: "draft"` field and `mergedFromIds: string[]`, or do we create a separate `MergeProposalSchema` that does not touch `notes.json` until approved?

## 2. Background Job & State Architecture
The introduction of asynchronous LLM calls and a secondary vector database (Weaviate) creates sync and durability risks:
- **Async Job Durability (M1):** Auto-taxonomy triggers asynchronously without blocking the "Save Note" API response. Can we rely on floating in-memory Node.js Promises within the Express API (accepting the risk that a container restart drops the job), or do we need a lightweight queue (e.g., BullMQ + Redis, or a local SQLite outbox)?
- **Vector Sync Guarantee (M2):** The system must maintain parity between `data/notes.json` and Weaviate. How are Weaviate updates triggered reliably? Does `store.ts` emit an internal Node event on every CRUD operation? What is the reconciliation strategy if the vector upsert fails but the JSON save succeeds?
- **Worker Container vs. API Process (M3):** M3 requires a scheduled batch job. Does this heavy agentic workload run inside the existing `api` Docker container using `node-cron`, or do we introduce a dedicated `worker` service in `docker-compose.yml` to isolate compute?

## 3. Scale, API & Data Flow Strategy
- **Streaming RAG Responses (M2):** The UI needs to stream the AI's response for the chat feature. Do we broadcast the streaming text chunks over the existing `/api/events` SSE connection, or do we create a dedicated streaming HTTP endpoint specifically leveraging Vercel AI SDK?
- **Context Window Protection (M1):** What is the exact truncation or chunking logic if a user saves a massive note (e.g., 50,000 words)? 
- **Tag Bloat Resiliency (M1):** If the user accumulates 500+ unique tags, injecting all of them into the prompt will bloat context and increase cost. What is the heuristic or pre-filtering search used to select the top candidate tags *before* calling the LLM?
