## Why

This change integrates the GrowthBook React SDK into the frontend client to enable feature flags, A/B testing, and user telemetry. It establishes client-side event tracking routed to GrowthBook's Managed Warehouse, allowing the product team to evaluate feature performance and experiment variants in real-time.

## What Changes

- Add `@growthbook/growthbook-react` dependency to the frontend package.
- Initialize a GrowthBook React SDK client instance with auto-attributes and event tracking plugins enabled.
- Wrap the main application component tree with `GrowthBookProvider` to supply the GrowthBook context.
- Stream standard lifecycle events (`session_start` and `page_view`) on app boot.
- Track user actions on note management (create, delete, tag suggestions, label add/remove, search queries, filter selection).
- Support loading the GrowthBook Client Key securely from a `.env` environment variable.

## Capabilities

### New Capabilities
- `growthbook-telemetry`: Core frontend integration of GrowthBook SDK to manage auto-attributes, configure Managed Warehouse telemetry ingestion, and dispatch custom/prebuilt events (note life-cycle, search, filtering).

### Modified Capabilities

## Impact

- Frontend application package: `services/frontend/package.json`, `services/frontend/src/main.tsx`, and state/store logic.
- Environment variables: Added `VITE_GROWTHBOOK_CLIENT_KEY` to `.env`.
- Documentation: Updated `ARCHITECTURE.md` to detail the telemetry integration and event taxonomy.
