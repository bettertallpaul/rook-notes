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

- [x] 7. Create `tests/promptfoo/promptfooconfig.yaml` and a synthetic `dataset.json`.
- [x] 8. Integrate Vercel AI SDK in `src/server/ai/taxonomy.ts` using `generateObject`. Configured to support both Google (`gemini-1.5-flash`) and Anthropic models via `AI_PROVIDER` env variable.
- [x] 9. Implement `AbortController` timeout bounds (target P95 < 2.5s) on the LLM call.
- [x] 10. Implement Tag Pre-filtering (Keyword matching) to build candidate lists safely.
- [x] 11. Implement context window protection (truncation logic for massive notes).
- [x] 12. Run Promptfoo evals to verify >90% tag relevance and JSON schema adherence. *(Resolved: Model name updated to `gemini-flash-latest`)*

> [!NOTE]
> **API Troubleshooting (Gemini) Resolved**
> The `404 Not Found` error for `generateContent` was not due to API Key restrictions. The model name `gemini-1.5-flash` was deprecated/missing in the API version used by the Vercel AI SDK. This was resolved by updating the model identifier to `gemini-flash-latest` in both `taxonomy.ts` and `promptfooconfig.yaml`, and increasing the timeout bounds to 10s to accommodate free-tier latency.

> **🛑 STOP & REVIEW 2:** Review the LLM prompt, promptfoo evaluation setup, and the Vercel AI SDK implementation.

### Phase 3: Integration & Frontend UI
*Focus: Wiring the AI service to the store events and building the React UI.*

- [x] 13. Wire the AI service to the store events in `src/server/events/listeners.ts` via the new in-memory Task Manager.
- [x] 14. Update the frontend UI to display AI-applied tags with a subtle visual cue (e.g., sparkle icon).
- [x] 15. Add the "Suggested New Tags" UI element and wire up the 1-click confirmation endpoint (`PATCH /api/notes/:id`).
- [x] 16. Verify E2E: Saving a note triggers the AI asynchronously, and the UI updates reactively via SSE.

> **Post-M1 Refactor Pivot (Opt-In Intelligence)**
> * **Issue:** The current implementation triggers the AI on every note save (debounced), causing 429 rate limits on batch operations and burning quota. The 3-layer tag display is also confusing to end-users.
> * **Decision:** We are shifting from *Implicit Automation* to *Opt-In Intelligence*. We will halt background AI execution and introduce an explicit "Suggest Tags" user action, coupled with a simplified 3-state UI. See Phase 4.

> **🛑 STOP & REVIEW 3:** Final review of the working feature in the browser.

### Phase 4: UX Refactor (Opt-In Intelligence)
*Focus: Removing implicit background processing, introducing explicit user triggers, and simplifying the Tag UI.*

- [ ] 17. **Disable Background Triggers:** Remove or bypass the `EventEmitter` and debounce logic implemented in Phase 1 and 3 that triggers the LLM on every note save.
- [ ] 18. **New API Endpoint:** Create a new endpoint (`POST /api/notes/:id/suggest-tags`) that runs the Vercel AI SDK logic and `classifyLabels` function, but *returns* the array to the client instead of writing directly to `notes.json`.
- [ ] 19. **Frontend Trigger:** Add a "✨ Suggest Tags" button within the note editor UI that calls the new endpoint and stores the result in local component state.
- [ ] 20. **Tag UI Overhaul:** Refactor the UI component to strictly support three states:
    * `Applied` (Solid Red): Tags existing on the note (user-added or accepted).
    * `Suggested (Existing)` (Solid Purple): AI suggestions that already exist in the master taxonomy.
    * `Suggested (New)` (Dashed Purple outline + ✨ Sparkle): Novel AI suggestions that will add a new category to your taxonomy.
- [ ] 21. **Acceptance Workflow:** Wire the click events on the Purple suggested tags to move them into the `Applied` (Red) state, triggering a standard `PATCH /api/notes/:id` to save the note.

> **🛑 STOP & REVIEW 4:** Review the refactored Opt-In flow. Verify that bulk scripts (`make fresh`) no longer trigger AI evaluations and that the 3-state UI is intuitive.

---

## Verification Plan

### Automated Tests
1. **Promptfoo Evals:** Run `npx promptfoo eval` locally to verify >90% tag relevance and strict adherence to the requested JSON schema.
2. **Latency Test:** Verify that Vercel AI SDK timeouts successfully abort LLM calls exceeding 2.5s.
3. **Schema Tests:** Run existing unit tests (or add new ones) in `src/shared/schemas.ts` to verify the modified tag formats.

### Manual Verification

**Original Verification (Phases 1-3) - DEPRECATED BY PHASE 4**
1. ~**Async UX:** Save a note and verify the AI runs in the background, updating the tags via SSE without a page reload.~
2. ~**Debounce Logic:** Rapidly save a note 5 times and verify the AI SDK is only triggered once after a 2-second pause.~

**Refactored Manual Verification (Phase 4)**
1. **Explicit Trigger:** Open a note, type content, and verify the AI does *not* run automatically.
2. **Generation:** Click the "✨ Suggest Tags" button and verify the UI displays loading state, then surfaces purple tags.
3. **Visual Cues:** Verify that a completely novel tag appears with a dashed purple outline and a sparkle icon, while an existing taxonomy tag appears as solid purple *without* a sparkle.
4. **Acceptance:** Click a purple suggestion, verify it turns red, and confirm via page refresh that it has successfully persisted to the database.
5. **Rejection:** Click the (x) on a purple suggestion and verify it is removed from the UI without affecting the saved note.
6. **Context Limits:** Paste a massive Lorem Ipsum document (>50k words) and verify the LLM call does not fail with token exhaustion.