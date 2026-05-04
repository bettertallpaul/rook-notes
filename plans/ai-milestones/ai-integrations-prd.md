## Rook Notes AI Integrations PRD

**Objective:** Equip Rook Notes with foundational AI capabilities to automate taxonomy, enable semantic retrieval, and maintain database hygiene, serving as a hands-on playground for LLM integration, structured outputs, and RAG architectures.

### Goals & Non-Goals

**Goals:**

-   Automate the application of taxonomy to keep vaults organized with zero manual effort.
-   Enable users to query their personal knowledge base using natural language.
-   Proactively identify and surface duplicate content for user review.
-   Build a foundational, AI-agnostic architecture capable of safely processing personal data.

**Non-Goals:**

-   The AI will **not** autonomously edit, rewrite, or delete any user notes.
-   The AI will **not** browse the live internet to answer questions (strictly RAG over the user's vault).
-   We are not building a fully autonomous agent; human-in-the-loop (HITL) is required for destructive or organizational actions.

### Success Metrics

These are theoretical in the context of this sandbox project:

-   **Feature Adoption Rate:** >20% of Daily Active Users (DAU) actively engaging with the "Chat with my Vault" feature within 30 days of launch.
-   **Task Success / Accuracy (Implicit):** >85% tag retention rate (users do not delete or overwrite the tags applied by the AI).
-   **Task Success / Accuracy (Explicit):** >90% positive feedback (thumbs up) on RAG chat responses.

### Milestone 1: Auto-Taxonomy (The "Structured Output" Phase)

_Focus: Mastering prompt engineering, API function calling, and structured JSON outputs._

-   **User Story:** As a user, when I click 'Suggest Tags' on a note, I want the system to analyze my content and suggest both existing and new tags, so that I maintain full control over my vault's organization while still benefiting from AI assistance.
-   **Acceptance Criteria:**
    
    -   **Three-State Tag UI:** The system suggests tags without applying them silently. Suggestions are categorized into three distinct UI states:
        1. **Applied Tags (Solid Red):** Tags already saved to the note by the user.
        2. **Suggested Existing Tags (Solid Purple with Sparkle):** Tags that exist in the vault and are safe to add.
        3. **Suggested New Tags (Dashed Purple with Sparkle):** Novel tags that warn of potential taxonomy bloat.
    -   API handles LLM timeouts gracefully (target P95 < 2.5s) without blocking the note-saving process.

### Milestone 2: "Chat with my Vault" (The "Vector & RAG" Phase)

_Focus: Introducing semantic search, text chunking, embeddings, and basic retrieval frameworks._

-   **User Story:** As a user, I want to ask natural language questions about my accumulated knowledge and receive synthesized answers with citations, so I can extract value from my notes without manually reading them.
-   **Acceptance Criteria:**
    
    -   A semantic search storage solution successfully runs locally or connects securely.
    -   User can query the vault and receive a context-aware answer with specific citations linking back to the source notes.
    -   **Graceful Degradation:** The system must clearly state when it lacks the context to answer a query (empty states/unanswerable questions) rather than hallucinating an answer.
    -   **RAG Evaluation Criteria:** System answers meet strict evaluation thresholds for _Faithfulness_ (the answer stays true to the retrieved notes) and _Answer Relevancy_ (it directly and usefully answers the user's prompt).

### Milestone 3: Intelligent Deduplication (The "Agentic Workflow" Phase)

_Focus: Leveraging existing semantic search infra for batch processing, similarity thresholds, and multi-step logic._

-   **User Story:** As a user, I want the system to proactively identify highly similar or duplicate notes and suggest merging them, so my vault remains clean and concise over time.
-   **Acceptance Criteria:**
    
    -   The system identifies duplicate candidates with a reliably low false-positive rate, ensuring the user's Merge Review queue is highly relevant and does not cause alert fatigue (Engineering to tune similarity thresholds to achieve this UX outcome).
    -   LLM correctly differentiates between a true duplicate note and two different notes about the same overarching topic.
    -   UI presents a "Merge Review" queue before destructively altering the database, strictly enforcing a human-in-the-loop approval process.

## Technical Stack Decisions

To support the requirements above, the project will utilize the following technology stack, balancing developer experience for simple generation with robust orchestration for complex workflows:

-   **Hybrid Framework Approach (Vercel AI SDK + LangGraph):** 
    -   **Vercel AI SDK:** Used for M1 and M2. Its `generateObject` and `streamText` functions provide superior type-safety and seamless Zod integration for structured taxonomy generation and basic RAG streaming.
    -   **LangGraph:** Introduced strictly for M3. It natively supports the complex, stateful, multi-actor workflows required for the Deduplication Agent, where standard JS control flows become too brittle.
-   **Semantic Search / Vector Storage: Weaviate (Local) / Pinecone (Cloud).** Defaulting to Docker-hosted Weaviate to support local development and strict privacy. If infrastructure overhead becomes too high, we will pivot to Pinecone (Serverless) for managed API-driven vector storage.
-   **Observability & Telemetry: LangSmith.** LangSmith will be integrated natively for end-to-end trace visibility, prompt management, and built-in LLM-as-a-judge evaluation pipelines.
-   **Evaluation CLI: Promptfoo.** Retained specifically for fast, local unit testing of structured JSON outputs during Milestone 1.

## Implementation Architecture & Flows

### 1. Feature Architecture Flows

-   **Milestone 1 (Auto-Taxonomy):**
    
    -   **Flow:** Intercept the explicit 'Suggest Tags' frontend button click. The API calls the LLM, returns a temporary array of categorized suggestions (`suggested_existing` and `suggested_new`), and the UI displays them. Nothing is written to the database until the user explicitly accepts a tag.
    -   **Constraint:** Force the LLM to return a strict JSON schema to prevent application crashes when parsing the response.
-   **Milestone 2 (RAG & Retrieval):**
    
    -   **Ingestion (Derived Index Pattern):** Create a script to backfill existing notes. For ongoing updates, the "Save Note" API will emit an event rather than blocking. A background worker will catch the event, generate embeddings, and upsert the vector alongside a Zod-validated metadata payload (e.g., tags) into the semantic index.
    -   **Eval Trigger:** Automatically run the synthetic evaluation suite whenever the chunking strategy is modified to measure the impact on retrieval relevancy.
    -   **Retrieval & Metadata Filtering:** Support pre-filtering by metadata (e.g., filtering by `#tags`) before performing the top-k vector similarity search. Embed user query -> perform filtered search -> pass retrieved chunks + query to LLM -> stream response to UI.
    -   **UI/UX:** Requires a new Chat UI component in React capable of handling streaming text responses (via standard SSE or framework callbacks) and uniquely displaying citations/references to build user trust.
-   **Milestone 3 (Deduplication Agent):**
    
    -   **Flow:** Create a scheduled batch job (e.g., running nightly via cron) rather than triggering on every save, preventing O(N²) compute spikes. When run, it queries the semantic index for note pairs with high cosine similarity scores.
    -   **Agentic Logic:** Pass the highly similar pairs to an LLM "Evaluator" agent to determine if they are true duplicates or just related concepts. If true duplicates, trigger a "Merge" agent to combine the text logically.
    -   **UI/UX:** Requires scoping a "Merge Review" UI queue (e.g., a new tab in the Sidebar) where users can view a diff of the LLM's proposed merge and explicitly approve or reject it, keeping a human-in-the-loop.

### 2. Observability, Synthetic Testing & Performance

-   **Synthetic Data Pipeline:**
    
    -   **Golden Datasets:** Engineering will generate a "Golden Dataset" of synthetic markdown notes, Q&A pairs, and intentionally duplicated notes using a frontier model.
    -   **M1 (Taxonomy) Automated Evals:** Run Promptfoo locally against synthetic notes, asserting >90% exact-match accuracy for JSON schema compliance and tag relevance.
    -   **M2 (RAG) LLM-as-a-Judge:** The _Faithfulness_ and _Answer Relevancy_ criteria will be tested automatically using LangSmith evaluators on synthetic Q&A pairs before any code merges.
    -   **M3 (Deduplication) Recall Testing:** Prove our "low false-positive rate" by running the deduplication logic against the seeded dataset to ensure 100% recall on known duplicates while ignoring thematically similar but distinct notes.
-   **Latency Validation & Performance:**
    
    -   **M1 Latency:** Automated tests will simulate the "Save Note" API call to ensure the LLM roundtrip consistently hits the `< 2.5s P95` latency constraint.
    -   **M2 Local Execution Constraints:** Even when running the storage index locally in Docker, a full user-facing RAG retrieval cycle (Chat with Vault) must execute within 5 seconds to ensure the system remains snappy.
    -   **M3 Background Constraints:** The Deduplication batch job has no strict latency constraints. As a background process, it strictly prioritizes evaluation accuracy and recall over speed.

### 3. Scale, Cost & Privacy Constraints

To demonstrate enterprise-grade product thinking (crucial for PM interviews), the implementation plan must address these boundary conditions:

-   **Context Window Protection (M1):** If a user pastes a massive 50,000-word document, the system must intelligently truncate or summarize the text before sending it to the LLM for taxonomy, preventing token exhaustion and controlling costs.
-   **Tag Bloat Resiliency (M1):** The taxonomy prompt must gracefully handle vaults with hundreds of existing tags. If the tag list risks exhausting the context window, engineering must implement a pre-filtering semantic search to only pass the most relevant *candidate* tags to the LLM.
-   **Unit Economics:** Because M1 now relies on an explicit user opt-in rather than firing on every save, API quota burn is drastically reduced. We can comfortably use models like Gemini 1.5 Flash without aggressive rate-limiting.

## Appendix: Alternatives Considered

**The "All-In" LangChain Stack (Rejecting Vercel AI SDK entirely)**

-   **Initial Concept:** Standardize exclusively on LangChain.js across all three milestones to maintain a single abstraction layer from simple generation to complex agents.
-   **Why it was rejected:** LangChain's abstractions for basic structured output generation are heavier and less intuitively type-safe than Vercel AI SDK's `generateObject`. Forcing LangChain into M1 and M2 introduces unnecessary verbosity and slows engineering velocity. A hybrid approach ensures we use the most ergonomic tool for the right level of complexity.