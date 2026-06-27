## Why

Unifying sidebar filter events under a single event name with attributes reduces event taxonomy complexity. Instead of managing separate event types for lifecycle filters and label filters, downstream analytics platforms like GrowthBook can consume a single event stream for all sidebar filter interactions, simplifying dashboard creation, funnel analysis, and experiment targeting.

## What Changes

- Remove the distinct `lifecycle_filter_selected` and `label_filter_selected` events.
- Introduce a single `sidebar_filter_selected` event.
- Attach the following attributes to the `sidebar_filter_selected` event:
  - `filterType`: The type of sidebar filter clicked (`"lifecycle"` or `"label"`).
  - `filterValue`: The specific filter value selected, only tracked for lifecycle filters (`"all"`, `"recent"`, or `"stale"`). Label filter names are not tracked to keep the event footprint clean and avoid excessive noise.
- Remove the `noteId` attribute from `note_created`, `note_deleted`, `label_added`, `ai_tags_suggested`, and `label_removed` event payloads to reduce telemetry noise.
- Update the telemetry event dispatches in the React state store (`useNoteStore.ts`).
- Update `ARCHITECTURE.md` to reflect the unified event format.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `growthbook-telemetry`: Unify sidebar lifecycle and label filter selections under a single event `sidebar_filter_selected` with attributes.

## Impact

- **Frontend store**: `services/frontend/src/store/useNoteStore.ts`
- **Documentation**: `ARCHITECTURE.md`
- **Telemetry Specification**: `openspec/specs/growthbook-telemetry/spec.md` (via delta spec)
