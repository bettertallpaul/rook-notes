## 1. Custom Provider Wrapper Implementation

- [ ] 1.1 Import `GrowthBookProvider` from `@growthbook/growthbook-react` inside `services/frontend/src/lib/growthbook.ts`.
- [ ] 1.2 Implement and export a custom `AppGrowthBookProvider` component in `services/frontend/src/lib/growthbook.ts` that pre-binds the local `growthbook` client instance.

## 2. Refactor React Entrypoint

- [ ] 2.1 Update `services/frontend/src/main.tsx` to import `AppGrowthBookProvider` from `./lib/growthbook` instead of `@growthbook/growthbook-react`.
- [ ] 2.2 Remove the unused `growthbook` instance import and the `growthbook={growthbook}` prop reference from `main.tsx`.
- [ ] 2.3 Verify the frontend service builds and runs correctly.
