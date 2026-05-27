# Session Summary: Chat with my Vault (Langfuse Update)

This document summarizes the current status and decisions for the **Chat with my Vault** (RAG) feature. We have shifted the observability/telemetry choice from SaaS-based LangSmith to a self-hosted, local **Langfuse** deployment.

## Core Decisions & Stack Alignment

1. **Vector Database**: **Weaviate** running locally inside a Docker container (ports `8080` for HTTP, `50051` for gRPC).
2. **Embeddings Engine**: Purely local **`@huggingface/transformers`** running `all-MiniLM-L6-v2` inside the API container (384-dimensional dense vectors).
3. **Primary Store**: Keep `notes.json` as the single source of truth for notes CRUD. Weaviate is strictly a derived index.
4. **AI Observability (Langfuse)**:
   - **Local Tracing**: Avoid external telemetry networks entirely. Traces will export locally to a Docker-hosted **Langfuse** service running at `http://langfuse:3000`.
   - **Dual-Loop Quality**:
     - **Pre-Release**: Local regression validations using **Promptfoo** against a Golden QA Dataset.
     - **Post-Release**: Trace collection with Langfuse.
     - **Flywheel**: Export failed user query logs from Langfuse to enrich Promptfoo's test suite, ensuring continuous improvement.
5. **Environment Configuration**:
   - Added variables to `.env`: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST=http://langfuse:3000`.
   - Telemetry automatically degrades gracefully if variables are omitted, keeping the system fully operational offline.

## Artifacts Updated

All OpenSpec artifacts for the `chat-with-my-vault` change have been updated to completely reflect the Langfuse stack:
- [proposal.md](file:///Users/paulbernier/Developer/workspace/code/rook-notes/openspec/changes/chat-with-my-vault/proposal.md): Outlines goals, impacts, and the dual-loop Promptfoo + Langfuse architecture.
- [design.md](file:///Users/paulbernier/Developer/workspace/code/rook-notes/openspec/changes/chat-with-my-vault/design.md): Details Weaviate schema reconciliation, local MiniLM, and Langfuse tracing rationale.
- [spec.md](file:///Users/paulbernier/Developer/workspace/code/rook-notes/openspec/changes/chat-with-my-vault/specs/chat-with-my-vault/spec.md): Specifies behavioral requirements, runtime telemetry triggers, and golden dataset expectations.
- [tasks.md](file:///Users/paulbernier/Developer/workspace/code/rook-notes/openspec/changes/chat-with-my-vault/tasks.md): Configured with Langfuse package installations, env mapping, and the telemetry flywheel extraction task.

## Next Steps

1. **Verify Change Artifacts**: Check that all OpenSpec templates are verified using `openspec status --change "chat-with-my-vault"`.
2. **Execute Change Implementation**: Initiate implementation phase by running `/opsx-apply` in chat or applying tasks from `tasks.md`.
