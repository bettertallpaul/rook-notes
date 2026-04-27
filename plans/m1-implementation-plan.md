# Milestone 1: Auto-Taxonomy (Implementation Plan)

This document outlines the implementation plan for Milestone 1 (Auto-Taxonomy), as defined in the AI Integrations PRD. It establishes the foundational schema, event handling, and AI infrastructure, keeping in mind the future needs of M2 (Vector/RAG) and M3 (Deduplication Agent).

## Resolved Architectural Decisions

> [!NOTE]
> **1. Data Model Extension (Schema): Option B (Object Array)**
> Modified `NoteSchema` to `labels: { name: string, source: "user" | "ai_auto" | "ai_suggested" }[]`. This maps correctly to the UI states (subtle cues, 1-click confirmation) and keeps `schemas.ts` as the single source of truth.

> [!NOTE]
> **2. Async Job Durability: Option A (In-Memory Task Manager)**
> For M1, we will stick to a lightweight Node.js Task Manager to handle floating promises. We accept that jobs may be lost on container restart. We will defer building a robust queue (SQLite outbox) to M3.

> [!NOTE]
> **3. Tag Bloat Resiliency: Option B (Basic Keyword Matching)**
> We will use keyword/substring matching against the note content to build a candidate list of tags. This is fast, requires zero infra, and safely protects the context window without naively dropping rare tags.

---

## Task Breakdown & Status

We will execute the plan in three distinct phases. Each phase ends with a **Review Checkpoint** for you to inspect the work before we move on.

### Phase 1: Foundation & Data Model
*Focus: Upgrading the schema and decoupling side-effects via an event emitter.*

- [x] 1. Update `NoteSchema` in `src/shared/schemas.ts` and `src/types/note.ts` to use object array tags.
- [x] 2. Update existing UI components to map the new object array tag format correctly.
- [x] 3. Update MCP server (`src/server/mcp.ts`) tools `create_note` and `edit_note` to handle the new object-based tag schema to prevent Claude Code integration from breaking.
- [x] 4. Introduce `EventEmitter` in `src/server/store.ts` to trigger side-effects asynchronously after disk writes.
- [x] 5. Implement basic debounce/rate-limiting on the event listener to prevent blasting the LLM API on rapid saves.
- [x] 6. Update the Express API to handle the new schema and ensure backwards compatibility if needed.
> **🛑 STOP & REVIEW 1:** Review the schema changes and the event-emitter integration before we touch the AI SDK.

### Phase 2: AI Service & Evaluation Setup
*Focus: Writing the LLM prompt, integrating Vercel AI SDK, and validating structured outputs.*

- [ ] 7. Create `tests/promptfoo/promptfooconfig.yaml` and a synthetic `dataset.json`.
- [ ] 8. Integrate Vercel AI SDK in `src/server/ai/taxonomy.ts` using `generateObject`. Configure to use fast frontier model (e.g., Claude 3 Haiku).
- [ ] 9. Implement `AbortController` timeout bounds (target P95 < 2.5s) on the LLM call.
- [ ] 10. Implement Tag Pre-filtering (Keyword matching) to build candidate lists safely.
- [ ] 11. Implement context window protection (truncation logic for massive notes).
- [ ] 12. Run Promptfoo evals to verify >90% tag relevance and JSON schema adherence.
> **🛑 STOP & REVIEW 2:** Review the LLM prompt, promptfoo evaluation results, and the Vercel AI SDK implementation.

### Phase 3: Integration & Frontend UI
*Focus: Wiring the AI service to the store events and building the React UI.*

- [ ] 13. Wire the AI service to the store events in `src/server/events/listeners.ts` via the new in-memory Task Manager.
- [ ] 14. Update the frontend UI to display AI-applied tags with a subtle visual cue (e.g., sparkle icon).
- [ ] 15. Add the "Suggested New Tags" UI element and wire up the 1-click confirmation endpoint (`PATCH /api/notes/:id`).
- [ ] 16. Verify E2E: Saving a note triggers the AI asynchronously, and the UI updates reactively via SSE.
> **🛑 STOP & REVIEW 3:** Final review of the working feature in the browser.

---

## Verification Plan

### Automated Tests
1. **Promptfoo Evals:** Run `npx promptfoo eval` locally to verify >90% tag relevance and strict adherence to the requested JSON schema.
2. **Latency Test:** Verify that Vercel AI SDK timeouts successfully abort LLM calls exceeding 2.5s.
3. **Schema Tests:** Run existing unit tests (or add new ones) in `src/shared/schemas.ts` to verify the modified tag formats.

### Manual Verification
1. **End-to-End Save:** Start the Docker stack (`make dev`), create a new note, and save.
2. **Async UX:** Verify the note saves immediately, and the UI receives an SSE event a few seconds later updating the tags.
3. **Visual Cues:** Verify AI-applied tags have the correct visual styling.
4. **Suggested Tags:** Verify that a note about a completely novel concept surfaces a "Suggested Tag" instead of auto-applying it, and test the 1-click confirmation workflow.
5. **Context Limits:** Paste a massive Lorem Ipsum document (>50k words) and verify the LLM call does not fail with token exhaustion.
6. **Debounce Logic:** Rapidly save the same note 5 times and verify only 1 LLM call is made.
