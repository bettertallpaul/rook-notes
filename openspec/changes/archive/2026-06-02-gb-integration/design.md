## Context

The rook-notes frontend client is a React application built with Vite. Product decisions and experimentation require user telemetry and feature flags. GrowthBook provides a feature-flagging and experimentation platform that can be integrated using their React SDK. We have selected the Managed Warehouse ingestion option, meaning events are sent directly to GrowthBook's tracking API instead of a self-managed ingestion backend.

## Goals / Non-Goals

**Goals:**
- Integrate the `@growthbook/growthbook-react` SDK into the frontend client.
- Securely load the GrowthBook client key from environment variables.
- Route experiment view events and custom telemetry events automatically to GrowthBook's ingestion API.
- Trace standard lifecycle, note management, label/tag, search, and navigation events.
- Update architecture documentation to reflect the telemetry integration.

**Non-Goals:**
- Backend event logging or backend GrowthBook SDK integration (focused strictly on frontend client telemetry).
- Custom database-backed analytics tracking.

## Decisions

### 1. Ingestion Method: Managed Warehouse & SDK Plugins
- **Decision:** Load the standard `growthbookTrackingPlugin` and `autoAttributesPlugin` from `@growthbook/growthbook/plugins` or the SDK.
- **Rationale:** We are using GrowthBook's Managed Warehouse option. These plugins auto-target attributes and direct events straight to GrowthBook's ingestion endpoint without needing custom server-side routing or proxy endpoints in the development environment.

### 2. Environment Configuration: Vite Environment Variables
- **Decision:** Define `VITE_GROWTHBOOK_CLIENT_KEY` in `.env` and retrieve it via `import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY`.
- **Rationale:** Vite exposes environment variables prefixed with `VITE_` to the browser bundles. This allows client key injection at build time or during local development without hardcoding it in the source.

### 3. Event Debouncing: Search Queries
- **Decision:** Implement a debounced tracking utility for search input queries.
- **Rationale:** Keystrokes generate too many network requests if logged immediately. Debouncing search queries by 500ms filters out rapid typing and only captures complete/paused search terms.

### 4. Integration Point: State Manager (Zustand/NoteStore) Integration
- **Decision:** Track events directly inside the actions of `useNoteStore` instead of scattering telemetry calls across individual UI components.
- **Rationale:** Centralizing telemetry in the state store actions ensures consistency, avoids double-triggering, makes refactoring easier, and keeps view components clean.

## Risks / Trade-offs

- **Risk:** Client key exposure in frontend bundle.
  - **Mitigation:** The GrowthBook client key (SDK key) is public by design for browser clients and only allows fetching flag configurations and logging events. It does not grant administrative write access to the GrowthBook dashboard.
- **Risk:** Network request overhead from excessive tracking.
  - **Mitigation:** Debounce search query telemetry and consolidate label operations. Limit telemetry to key actions.
