## Context

The React entrypoint (`services/frontend/src/main.tsx`) needs to initialize the GrowthBook React SDK by wrapping the component tree in `<GrowthBookProvider growthbook={growthbook}>`. 
Currently, the import is split across two modules:
1. `GrowthBookProvider` from `@growthbook/growthbook-react`
2. `growthbook` from `./lib/growthbook`

This leaks implementation details of our SDK initialization to the entrypoint and makes it harder to modify the initialization logic or swap provider implementations later.

## Goals / Non-Goals

**Goals:**
- Centralize all dependencies on `@growthbook/growthbook-react` inside `services/frontend/src/lib/growthbook.ts`.
- Expose a clean, pre-bound `AppGrowthBookProvider` component from the utility layer.
- Clean up the main entrypoint file.

**Non-Goals:**
- Modify telemetry tracking endpoints or events.
- Change hooks used by other components to retrieve feature flags.

## Decisions

### Decision 1: Custom local wrapper component vs. Re-exporting raw component
- **Option A (Re-exporting raw provider):** Re-export the third-party provider and client directly. This still requires `main.tsx` to bind `growthbook` as a prop.
- **Option B (Custom React wrapper component - Chosen):** Create a custom React functional component `AppGrowthBookProvider` in `growthbook.ts` that internally feeds the initialized `growthbook` client instance into the library's provider.
- **Rationale:** Option B removes all SDK-specific instantiation details from the React entrypoint, making `main.tsx` cleaner and protecting it from any future SDK API changes.

## Risks / Trade-offs

- **Risk:** Having a local component named the same as the package's provider might lead to import confusion.
- **Mitigation:** Name our utility component `AppGrowthBookProvider` explicitly to distinguish it from `@growthbook/growthbook-react`'s `GrowthBookProvider`.

