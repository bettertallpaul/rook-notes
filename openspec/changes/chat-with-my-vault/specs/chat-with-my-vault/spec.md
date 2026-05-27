## ADDED Requirements

### Requirement: Event-Driven Vector Syncing
The system SHALL intercept note CRUD operations and asynchronously synchronize the changes (insertions, updates, deletions) with the local Weaviate search index.

#### Scenario: Async index on note save
- **WHEN** a note is created or updated in the system
- **THEN** the system SHALL emit a note change event, chunk the note text, calculate embeddings locally, and upsert the vector record to Weaviate in a non-blocking background process

#### Scenario: Remove record on note deletion
- **WHEN** a note is deleted from the primary store
- **THEN** the system SHALL delete all associated vectors from Weaviate

### Requirement: Purely Offline Embedding Generation
The system SHALL generate high-performance text embeddings locally using `@huggingface/transformers` and a cached `all-MiniLM-L6-v2` model, executing entirely offline on CPU/GPU without external network requests.

#### Scenario: Successful local embedding generation
- **WHEN** text is passed to the embedding service
- **THEN** the system returns a 384-dimensional floating-point array generated purely locally

### Requirement: Dual-Mode Search Omnibox
The system SHALL present a central command search bar (Omnibox) that defaults to instant keyword filtering of note headers and contents, while displaying a dynamic action to pivot into a persistent Vault Chat thread.

#### Scenario: Text entry yields keyword matches
- **WHEN** the user types text into the Omnibox
- **THEN** the dropdown list displays instant matches on titles, labels, or content bodies

#### Scenario: Pressing Enter launches chat mode
- **WHEN** the user focuses the Omnibox and presses the [Enter ↵] key or clicks the "Ask AI" button
- **THEN** the search bar collapses and a dedicated conversational chat panel slides open from the right side of the screen

### Requirement: Context-Aware Streaming Chat (RAG)
The system SHALL receive conversational user queries, embed the query, perform hybrid similarity searches against Weaviate (optionally pre-filtered by selected tags), and stream the synthesized response back to the client using Vercel AI SDK alongside interactive citation badges.

#### Scenario: User queries vault
- **WHEN** a user enters a query in the Chat Panel
- **THEN** the system retrieves matching chunks, sends them to the generative model, streams text chunks back in real-time, and renders clickable badges linking directly to the source notes

#### Scenario: Graceful degradation on missing context
- **WHEN** the user asks a question that does not match any information stored in the retrieved note chunks
- **THEN** the system SHALL state that it does not have the context to answer the question, avoiding hallucinated information

### Requirement: Dual-Loop LLMOps Quality Framework
The system SHALL establish a complementary dual-loop quality verification lifecycle coupling local, offline pre-release regression evaluations (Promptfoo) with live post-release telemetry tracing (Langfuse).

#### Scenario: Running offline Promptfoo regression assertions
- **WHEN** a local prompt, chunking strategy, or model is changed and Promptfoo CLI is run
- **THEN** the system SHALL execute assertion checks locally against the Golden Dataset, validating strict compliance on exact JSON formatting, latency, and context mapping before code commits

#### Scenario: Generating runtime telemetry traces during chat sessions
- **WHEN** a user issues a live RAG chat request in the app with `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` configured
- **THEN** the system SHALL generate spans capturing the local embedding steps, Weaviate hybrid filters, and LLM text generation tokens, exporting them to Langfuse for operational auditing


