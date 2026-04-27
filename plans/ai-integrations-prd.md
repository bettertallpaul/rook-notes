## Rook Notes AI Integrations

**Objective:** Equip Rook Notes with foundational AI capabilities to automate taxonomy, enable semantic retrieval, and maintain database hygiene, serving as a hands-on playground for LLM integration, structured outputs, and RAG architectures. The approach needs to be AI agnostic to make it easier to switch between different LLM providers.

### Milestone 1: Auto-Taxonomy (The "Structured Output" Phase)
*Focus: Mastering prompt engineering, API function calling, and structured JSON outputs.*

* **User Story:** As a user, when I save a new note, I want the system to automatically apply the most relevant existing tags (and suggest a new one only if absolutely necessary) so that my vault remains organized without manual effort.
* **Acceptance Criteria:**
    * System applies 1-3 relevant tags from the existing database list.
    * System prevents taxonomy bloat (hallucinates 0 non-approved tags).
    * API handles LLM timeouts gracefully without blocking the note-saving process.


### Milestone 2: "Chat with my Vault" (The "Vector & RAG" Phase)
*Focus: Introducing Vector databases, text chunking, embeddings, and basic retrieval frameworks.*

* **User Story:** As a user, I want to ask natural language questions about my accumulated knowledge and receive synthesized answers with citations, so I can extract value from my notes without manually reading them.
* **Acceptance Criteria:**
    * Vector DB successfully runs locally in Orbstack.
    * User can query the vault and receive a context-aware answer.
    * The LLM cites the specific notes it used to generate the answer.


### Milestone 3: Intelligent Deduplication (The "Agentic Workflow" Phase)
*Focus: Leveraging existing vector infra for batch processing, similarity thresholds, and multi-step logic.*

* **User Story:** As a user, I want the system to proactively identify highly similar or duplicate notes and suggest merging them, so my vault remains clean and concise over time.
* **Acceptance Criteria:**
    * System successfully flags notes with >90% semantic similarity.
    * LLM correctly differentiates between a duplicate note and two different notes about the same topic.
    * UI presents a "Merge Review" queue before destructively altering the database.


## Implementation Plan & Strategy

### 1. The Critical Prerequisite: Database Migration
Before starting Milestone 1, the system must migrate from the current local JSON store (`notes.json`) to a robust database to support future vector operations and concurrent agentic workflows without rewriting the core saving logic later.
* **Action:** Migrate to **PostgreSQL** with the `pgvector` extension.
* **ORM:** Use **Drizzle ORM** for type-safe interactions and first-class `pgvector` support.

### 2. The Framework Stack
To satisfy the "AI-agnostic" requirement, two distinct paths have been identified. We will evaluate these via a technical Spike (see section 4).

* **Path A: The Lightweight / AI-Agnostic Stack (Vercel AI SDK)**
  * **Best for:** M1 & M2. Standardizing across multiple LLM providers (OpenAI, Anthropic) with simple, type-safe JS functions (`generateObject`, `streamText`).
  * **Pros:** Incredibly easy to use, highly agnostic, minimal bloat.
  * **Cons:** Requires building custom state-machine logic for the complex M3 deduplication workflow.
* **Path B: The LangChain / LangGraph Ecosystem**
  * **Best for:** M3. Complex, stateful workflows with human-in-the-loop interactions (like the M3 "Merge Review").
  * **Pros:** Native pausing/resuming of agents, built-in vector integrations, native observability (LangSmith).
  * **Cons:** Heavy abstractions, steep learning curve, feels less "close to the metal".

### 3. Observability & Evals
If proceeding with the lightweight Vercel AI SDK (Path A), the following tooling is recommended to maintain enterprise-grade visibility and testing:
* **Observability:** **Langfuse** (self-hosted locally in Orbstack via Docker) or **Helicone** (proxy-based, zero-code setup).
* **Evals:** **Promptfoo**. An open-source CLI tool to run the exact same prompt across multiple models concurrently (e.g., `gpt-4o` vs `claude-3-haiku`) to objectively compare cost, speed, and accuracy for Milestone 1.

### 4. Experimentation Workflow (The "Spike")
To determine the best framework (Vercel AI SDK vs LangChain), we will run a Technical A/B test on Milestone 1 without polluting the main codebase.

* **Approach:** Use **Git Branches** to isolate experiments.
  * Create `spike-vercel` and `spike-langchain` branches off `main`.
  * Because the dev environment is containerized (Docker), switching branches and running `docker compose up --build` guarantees a clean, isolated test of each framework's Developer Experience and performance.
* **Alternative (Side-by-Side):** If simultaneous visual comparison is required, use `git worktree` to spawn a second physical folder linked to the same repo, adjusting the `docker-compose.yml` mapped ports in the second folder to prevent collisions.

### 5. Technical Architecture & Flows
To successfully achieve the milestones regardless of the chosen framework (LangChain or Vercel AI), the following architectural flows must be implemented:

* **Milestone 1 (Auto-Taxonomy):**
  * **Flow:** Intercept the "Save Note" API call. Fetch the array of `active_tags` from the DB. Pass the note content and `active_tags` to the LLM.
  * **Constraint:** Force the LLM to return a strict JSON schema to prevent application crashes when parsing the response.
* **Milestone 2 (RAG & Retrieval):**
  * **Ingestion:** Create a script to backfill existing notes: chunk text, generate embeddings (e.g., `text-embedding-3-small`), and store in the `pgvector` DB. Update the "Save Note" API to embed and store new notes upon creation.
  * **Retrieval:** Embed user query -> perform top-k similarity search in `pgvector` -> pass retrieved chunks + query to LLM as context -> stream response to UI.
* **Milestone 3 (Deduplication Agent):**
  * **Flow:** Create an asynchronous background job. When triggered, it queries the Vector DB for note pairs with a cosine similarity score above a strict threshold (e.g., > 0.92). 
  * **Agentic Logic:** Pass the highly similar pairs to an LLM "Evaluator" agent to determine if they are true duplicates or just related concepts. If true duplicates, trigger a "Merge" agent to combine the text logically.
