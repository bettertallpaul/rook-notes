## 1. Setup and Configuration

- [x] 1.1 Add `VITE_GROWTHBOOK_CLIENT_KEY=sdk-placeholder` to `.env` file.
- [x] 1.2 Add `@growthbook/growthbook-react` dependency to `services/frontend/package.json`.

## 2. GrowthBook SDK Initialization

- [x] 2.1 Create `services/frontend/src/lib/growthbook.ts` containing the singleton GrowthBook instance with `autoAttributesPlugin` and `growthbookTrackingPlugin`.
- [x] 2.2 Implement and export the `trackEvent` utility and debounced `trackSearchDebounced` function from `growthbook.ts`.

## 3. Application Integration

- [x] 3.1 Wrap the application component tree with `<GrowthBookProvider>` in `services/frontend/src/main.tsx`.
- [x] 3.2 Add a mounting effect in `services/frontend/src/App.tsx` to dispatch `session_start` and `page_view` events.
- [x] 3.3 Update `services/frontend/src/store/useNoteStore.ts` to log `note_created`, `ai_tags_suggested`, and `note_deleted` events.
- [x] 3.4 Update the `addLabel` and `removeLabel` methods in `useNoteStore.ts` to log label actions, with `addLabel` taking an optional `source` parameter.
- [x] 3.5 Update `setSearchQuery` to log search queries via `trackSearchDebounced`, and log `lifecycle_filter_selected` / `label_filter_selected` on filter updates in `useNoteStore.ts`.
- [x] 3.6 Modify `services/frontend/src/components/notes/LabelEditor.tsx` to pass the `'ai'` source when accepting AI suggestions.

## 4. Documentation

- [x] 4.1 Update `ARCHITECTURE.md` to document GrowthBook SDK configuration, client key environment variable, and the telemetry event taxonomy.

## 5. Verification

- [x] 5.1 Run `make test` to verify zero compile or unit test errors.
- [x] 5.2 Launch application containers via `make up` and manually verify event logging to console and GrowthBook API in browser DevTools.
