## Why

Currently, the React entrypoint component (`main.tsx`) directly imports the third-party `GrowthBookProvider` from `@growthbook/growthbook-react` and coordinates it with our custom `growthbook` instance initialized in `src/lib/growthbook.ts`. Centralizing the wrapping logic inside the local utility file encapsulates library details, provides a cleaner entrypoint configuration, and makes future SDK adjustments or mock setups much simpler.

## What Changes

- Wrap the raw `GrowthBookProvider` inside a custom React component within the `src/lib/growthbook.ts` utility file.
- Clean up `src/main.tsx` to use this new custom provider, removing its direct import dependency on `@growthbook/growthbook-react`.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `growthbook-telemetry`: Abstract the `GrowthBookProvider` configuration and instantiation detail inside the frontend utility module.

## Impact

- **Frontend Utility (`services/frontend/src/lib/growthbook.ts`)**: Introduces a custom `GrowthBookProvider` wrapper component.
- **Frontend Entrypoint (`services/frontend/src/main.tsx`)**: Replaces direct `@growthbook/growthbook-react` provider reference with the local wrapped provider.
