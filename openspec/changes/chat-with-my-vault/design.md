## Context

Rook Notes is a minimal, local, markdown-based note-taking application operating entirely on a local JSON file (`data/notes.json`) inside a Docker container. We want to implement a fully local, private, and highly interactive "Chat with my Vault" conversational retrieval-augmented generation (RAG) feature. This design outlines the infrastructure, embedding pipeline, derived index sync, and dual-mode UI details.

## Goals / Non-Goals

**Goals:**
- Provide a robust, 100% offline semantic search and RAG capability over notes.
- Sync the database state (`notes.json`) with the search index in a performant, non-blocking manner.
- Deliver an elegant, dual-mode search/chat interface (Omnibox) with cited sources mapped back to note editors.
- Build premium observability and automated quality assurance using Langfuse tracing and LLM-as-a-judge evaluators.

**Non-Goals:**
- Do not migrate primary note storage away from `notes.json` (keep Weaviate strictly as a derived index).
- Do not allow the AI to directly edit, modify, or delete note contents.
- Do not make external API requests for text embeddings (keep vectors on-device).

## Decisions

### 1. Vector Database: Weaviate (Local Docker Container)
- **Rationale**: Weaviate provides excellent performance, an extremely rich query API supporting structured filtering + vector search (hybrid search), and a modern Node.js v4 SDK. By using Docker-hosted Weaviate, we keep the stack unified, scalable, and isolated.
- **Alternatives Considered**: 
  - *Pinecone (Cloud)*: Rejected to guarantee offline functionality and strict privacy constraints.
  - *SQLite-VSS / PGVector*: Rejected due to complex multi-platform build toolchains and Docker setup constraints inside our existing Node environments.

### 2. Embedding Model: `@huggingface/transformers` (`all-MiniLM-L6-v2`)
- **Rationale**: Running embeddings locally in Node is highly performant with the `all-MiniLM-L6-v2` ONNX model. At ~90MB, it runs fast even on raw CPUs, is fully offline, has zero cost, and generates compact 384-dimension vectors that minimize Weaviate memory overhead.
- **Alternatives Considered**: 
  - *Google Gemini text-embedding-004 (API)*: Rejected because it breaks offline-first guarantees and introduces network API dependencies.

### 3. Sync & Derived Index Strategy: Event-Driven + Boot Reconciliation
- **Rationale**: When note contents change, the backend emits `storeEvents` internally. A background indexer listens to these events, chunks the note, generates embeddings, and upserts them to Weaviate asynchronously (non-blocking). On Express API startup, a reconciliation routine scans `notes.json` and updates any missing or outdated vectors.
- **Alternatives Considered**:
  - *Synchronous Save-blocking Indexing*: Rejected because embedding generation would block user note saving, increasing perceived latency.

### 4. Streaming & RAG Endpoint: Dedicated POST `/api/chat` Route
- **Rationale**: Utilizes the Vercel AI SDK `streamText` function returning standard Data Stream Protocol chunks. This enables seamless binding to React's `useChat` hook, automatically managing message context and token streams.
- **Alternatives Considered**:
  - *SSE Broadcast over /api/events*: Rejected to isolate transient chat token chunks from global client sync events.

### 5. AI Quality & Observability: Dual-Loop LLMOps Quality Framework (Promptfoo + Langfuse)
- **Rationale**: Production AI products require both pre-release guardrails and post-release monitoring. We implement a **Dual-Loop LLMOps Quality Framework** to seamlessly couple both environments locally:
  1. **Pre-Release Loop (The Guardrails / CI/CD)**: We use **Promptfoo** to execute offline regression tests against a local Golden Dataset (YAML) before any code or prompt changes are merged, asserting strict thresholds on token limits, output structures, and similarity.
  2. **Post-Release Loop (The Monitor / APM)**: We instrument the active backend using self-hosted **Langfuse** running inside our local Docker Compose. Every client chat session is traced in detail (embedding calculations, Weaviate retrieval scores, and Gemini text generation spans) with Vercel AI SDK's simplified Langfuse/OTel integration.
  3. **The Data Flywheel**: When users interact with the app, Langfuse captures live traces. Failed user queries (e.g. low-score sessions, thumbs-down feedback) are exported and added directly to the Promptfoo Golden Dataset, continually hardening the pre-release test suite.

```text
  +------------------------------------------------------------------+
  |              1. PRE-RELEASE EVAL LOOP (Promptfoo)                |
  |     Local Golden Dataset (QA Pairs) -> Offline Assertions        |
  +----------------────────────────┬────────────────────────────────-+
                                   |
                                   | (Build passes -> Deploy)
                                   ▼
  +------------------------------------------------------------------+
  |              2. POST-RELEASE TRACING LOOP (Langfuse)             |
  |   Live user queries -> Local Langfuse container -> Trace Portal  |
  +----------------────────────────┬────────────────────────────────-+
                                   |
                                   | (Identify low-score/failed runs)
                                   ▼
  +------------------------------------------------------------------+
  |             3. CONVERSATIONAL AUDIT & FLYWHEEL                   |
  |   Export user failure logs to enrich Promptfoo Golden Dataset    |
  +------------------------------------------------------------------+
```
- **Alternatives Considered**:
  - *Console Logging*: Rejected because it does not scale to structured nested trace tree analysis, nor does it support automated pre-merge evaluation metrics.
  - *SaaS-Only Tracing (LangSmith)*: Rejected because a self-hosted Langfuse container keeps all user traces completely local, secure, and 100% private.

## Risks / Trade-offs

- **[Risk] Container Resource Consumption** → **Mitigation**: Constrain the local Weaviate and Langfuse container memory allocations in `docker-compose.yml` and use the ultra-lightweight `MiniLM` model instead of heavier BERT embeddings.
- **[Risk] Sync Inconsistencies** → **Mitigation**: A lightweight startup checker maps all `notes.json` entries to Weaviate, backfilling any gaps or missing values on boot.
- **[Risk] Telemetry Overhead & Network Leaks** → **Mitigation**: Allow complete Opt-Out of tracing by setting `LANGFUSE_PUBLIC_KEY=""` in the `.env` configuration. The core search and local RAG code paths will continue to function fully offline.



