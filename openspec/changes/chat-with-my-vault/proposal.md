## Why

Equip Rook Notes users with the ability to query their personal knowledge base in natural language, enabling semantic search and conversational synthesis over their vaults with 100% offline data privacy, instant source citations, and zero API costs.

## What Changes

- **Weaviate Vector Storage Integration**: Add a local, Docker-hosted Weaviate database service to orchestrate semantic and similarity searches offline.
- **Event-Driven Derived Index Sync**: Connect backend note modification events (creation, update, deletion) to an asynchronous background worker that syncs notes to the vector store without blocking client edits.
- **Purely Local Embedding Generation**: Implement on-device embedding calculation inside the Node API service using `@huggingface/transformers` and the lightweight `all-MiniLM-L6-v2` model.
- **Dedicated Chat Streaming Endpoint**: Introduce a dedicated Express `POST /api/chat` endpoint utilizing Vercel AI SDK to stream tokenized RAG answers back to the client.
- **Dual-Mode Search Omnibox**: Upgrade the frontend search interface into a dual-mode omnibox that serves instant keyword filters while offering a single-press toggle to pivot into a persistent vault chat.
- **Interactive Chat Panel & Citation badging**: Build a sliding side-panel chat window with rich TipTap citation badge rendering, mapping markdown citations directly back to the original source notes in the vault.
- **Dual-Loop LLMOps Quality Framework (Promptfoo + Langfuse)**: Connect offline pre-release regression evaluations (Promptfoo running assertions on a local Golden Dataset) with real-time post-release tracing (Langfuse capturing live user sessions and metadata locally in Docker). Production anomalies and failed traces will feed back into the Promptfoo test suite, creating a self-improving AI product lifecycle.

## Capabilities

### New Capabilities
- `chat-with-my-vault`: Natural language retrieval, synthesis, and streaming chat interface over vault notes with local embeddings, hybrid tag pre-filtering, dynamic citation mapping, and the self-hosted Dual-Loop LLMOps Quality Framework.

### Modified Capabilities
<!-- None -->

## Impact

- **Services**: Adds `weaviate` and `langfuse` (plus standard Postgres dependency if needed, or using self-hosted light Langfuse image) to `docker-compose.yml`. Exposes ports `8080`/`50051` (Weaviate) and `3000` (Langfuse).
- **Dependencies**: Adds `weaviate-client`, `@huggingface/transformers`, and `langfuse` (or `@opentelemetry/sdk-node` exporting to Langfuse) to backend dependencies.
- **Backend API (`api` service)**: Exposes a new `POST /api/chat` streaming route with Langfuse tracing integration, runs background sync events, and executes the synthetic evaluation suite during testing.
- **Frontend App (`app` service)**: Extends `useNoteStore.ts` to manage chat panel toggle, prompt history, and streams. Upgrades `Sidebar` and search omnibox components.
- **Environment**: Requires `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, and `LANGFUSE_HOST=http://langfuse:3000` in `.env` to route tracing metrics locally.


