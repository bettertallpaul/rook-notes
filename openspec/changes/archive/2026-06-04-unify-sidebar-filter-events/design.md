## Context

Currently, the frontend dispatches two separate telemetry events for sidebar filter clicks: `lifecycle_filter_selected` and `label_filter_selected`. This split structure complicates analytics setup in downstream systems (like GrowthBook), requiring separate configurations for funnels and dashboards depending on the type of filter used.

## Goals / Non-Goals

**Goals:**
- Unify filter selection tracking under a single event name: `sidebar_filter_selected`.
- Provide sufficient context to differentiate filter types using custom attributes (`filterType` and optionally `filterValue`).
- Update frontend store implementation to dispatch the unified event.
- Update architectural documentation.

**Non-Goals:**
- Track other non-filter sidebar interactions (e.g. settings, collapse/expand).
- Modify the state management or active filtering logic itself.

## Decisions

### 1. Unified Event Payload Schema

We choose the following payload structure for the unified event `sidebar_filter_selected`:
```json
{
  "filterType": "lifecycle" | "label",
  "filterValue"?: "all" | "recent" | "stale"
}
```
`filterValue` is only provided when `filterType` is `"lifecycle"`. Label filters will omit `filterValue` to prevent excessive event noise.

**Alternatives Considered:**
- **Short attributes** (`{ type: "...", value: "..." }`): While more concise, standard terms like `type` or `value` are often overloaded or reserved in certain event ingestion pipelines. Using explicit names like `filterType` and `filterValue` avoids namespaces collisions.

### 2. Location of Event Dispatches

We will update the existing telemetry dispatches in `services/frontend/src/store/useNoteStore.ts`:
- Inside `setLifecycleFilter`, change `trackEvent('lifecycle_filter_selected', { filter: f })` to `trackEvent('sidebar_filter_selected', { filterType: 'lifecycle', filterValue: f })`.
- Inside `setActiveLabelFilter`, change `trackEvent('label_filter_selected', { label })` to `trackEvent('sidebar_filter_selected', { filterType: 'label' })` (omitting `filterValue`).

### 3. Removal of Note IDs from Telemetry Events

To prevent event payload noise and because tracking individual note UUIDs yields no analytics value for local/ephemeral note-taking instances, we will strip `noteId` from the following event payloads in `useNoteStore.ts`:
- `note_created`: Omit `noteId` from payload (sent as empty).
- `note_deleted`: Omit `noteId` from payload (sent as empty).
- `label_added` / `ai_tags_suggested`: Remove `noteId` but retain `{ label, source }`.
- `label_removed`: Remove `noteId` but retain `{ label }`.

## Risks / Trade-offs

- **[Risk] Downstream Dashboard Breakage**: Replacing the existing events will stop incoming data for `lifecycle_filter_selected` and `label_filter_selected`.
  - **Mitigation**: Any downstream telemetry dashboards, goals, or experiments built around the legacy events must be updated to reference `sidebar_filter_selected` filtered by `filterType`.
