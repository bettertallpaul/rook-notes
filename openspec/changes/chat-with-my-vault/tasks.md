## 1. Infrastructure Setup

- [ ] 1.1 Add Weaviate service to `docker-compose.yml` with exposed HTTP (8080) and gRPC (50051) ports and persistent volume mapping.
- [ ] 1.2 Add `weaviate-client`, `@huggingface/transformers`, and `langfuse` backend dependencies to `package.json`.
- [ ] 1.3 Update environment config and Zod schemas in `src/shared/schemas.ts` to support Weaviate connectivity and Langfuse tracing environment variables (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`).

## 2. Local Embedding & Search client Core

- [ ] 2.1 Implement purely offline text embedding generation inside `src/server/ai/embeddings.ts` using `@huggingface/transformers` (`all-MiniLM-L6-v2`).
- [ ] 2.2 Establish Weaviate database client creation and schema class initializations inside `src/server/ai/weaviate.ts`.
- [ ] 2.3 Create startup reconciliation sync script (`src/server/ai/sync.ts`) to backfill Weaviate with all current notes from `notes.json`.

## 3. Background Sync & Ingest Pipeline

- [ ] 3.1 Create recursive markdown chunking utility inside `src/server/ai/chunker.ts` to split notes cleanly around markdown headers.
- [ ] 3.2 Add background event handlers listening to Express `storeEvents` inside `listeners.ts` to chunk, embed, and index notes on `note:created` and `note:updated`.
- [ ] 3.3 Add delete event listener to purge associated note chunks in Weaviate on `note:deleted`.

## 4. Streaming RAG Chat Endpoint & Dual-Loop LLMOps

- [ ] 4.1 Implement semantic search retrieval utility inside Weaviate integration to perform cosine-similarity lookups with hybrid tag pre-filters.
- [ ] 4.2 Create `POST /api/chat` route in `src/server/api.ts` utilizing Vercel AI SDK to stream context-grounded prompt answers containing markdown citations.
- [ ] 4.3 Set up Promptfoo configuration (`promptfooconfig.yaml`) and seed local Golden Datasets inside `tests/promptfoo/` to execute pre-release regression assertions offline.
- [ ] 4.4 Integrate Langfuse SDK tracing with Vercel AI SDK streaming calls to export runtime spans to the local Langfuse container for post-release auditing.
- [ ] 4.5 Implement a data flywheel CLI script (`scripts/enrich-evals.ts`) to extract low-score or flagged Langfuse production traces and append them directly to the local Promptfoo Golden Dataset.

## 5. Front-End Omnibox & Conversational UI

- [ ] 5.1 Extend Zustand store `useNoteStore.ts` with chat state, message collections, streaming handler, and toggle flags.
- [ ] 5.2 Build sliding drawer `ChatPanel.tsx` interface displaying real-time streaming answers and collapsible citations.
- [ ] 5.3 Implement dynamic dual-mode search Omnibox interface allowing users to toggle between keyword filtering and chat prompts on Enter/click.
- [ ] 5.4 Style custom interactive TipTap link badges mapping cited notes directly to active note editor triggers.
