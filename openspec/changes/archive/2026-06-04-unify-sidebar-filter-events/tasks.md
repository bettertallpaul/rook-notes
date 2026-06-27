## 1. Implementation

- [x] 1.1 Update `setLifecycleFilter` in `services/frontend/src/store/useNoteStore.ts` to dispatch the unified `sidebar_filter_selected` event with `filterType: 'lifecycle'` and `filterValue: f`.
- [x] 1.2 Update `setActiveLabelFilter` in `services/frontend/src/store/useNoteStore.ts` to dispatch the unified `sidebar_filter_selected` event with `filterType: 'label'` (omitting `filterValue`).
- [x] 1.3 Update `createNote` in `services/frontend/src/store/useNoteStore.ts` to omit `noteId` from the `note_created` event payload.
- [x] 1.4 Update `deleteNote` and `deleteNotes` in `services/frontend/src/store/useNoteStore.ts` to omit `noteId` from the `note_deleted` event payloads.
- [x] 1.5 Update `addLabel` in `services/frontend/src/store/useNoteStore.ts` to omit `noteId` from the `label_added` and `ai_tags_suggested` event payloads.
- [x] 1.6 Update `removeLabel` in `services/frontend/src/store/useNoteStore.ts` to omit `noteId` from the `label_removed` event payload.

## 2. Documentation and Cleanup

- [x] 2.1 Update the telemetry event taxonomy in `ARCHITECTURE.md` to replace `lifecycle_filter_selected` and `label_filter_selected` with the new unified `sidebar_filter_selected` event structure.
- [x] 2.2 Update `ARCHITECTURE.md` to remove `noteId` from the payloads of `note_created`, `note_deleted`, `label_added`, `ai_tags_suggested`, and `label_removed` telemetry event descriptions.

## 3. Verification

- [x] 3.1 Build the application using `make build` to verify there are no TypeScript or compilation errors.
- [x] 3.2 Run the local container development environment and manually verify that the telemetry events are fired with correct attributes when clicking sidebar filters.
- [x] 3.3 Verify compilation of the frontend application using `make build`.
- [x] 3.4 Manually verify that note creation, deletion, label addition, and removal events are fired without the `noteId` attribute.
