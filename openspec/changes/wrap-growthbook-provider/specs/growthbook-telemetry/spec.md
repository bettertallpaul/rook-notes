## MODIFIED Requirements

### Requirement: GrowthBook SDK Initialization
The frontend application SHALL initialize the GrowthBook React SDK client instance with:
- The client API key loaded from `VITE_GROWTHBOOK_CLIENT_KEY`.
- The `apiHost` set to `https://cdn.growthbook.io`.
- Enabled dev mode based on development environment context.
- Enabled sticky bucketing using the cookie-backed `BrowserCookieStickyBucketService`.
- Enabled subscription to real-time flag changes.
- A tracking callback that dispatches an `"Experiment Viewed"` event with `experimentId` and `variationId` properties when an experiment variation is evaluated.
- Enabled SDK plugins: `autoAttributesPlugin` and `growthbookTrackingPlugin` to handle automatic attribute targeting and streaming event tracking.
- The application root wrapped in a custom, localized `AppGrowthBookProvider` wrapper component that pre-binds the initialized `growthbook` instance.

#### Scenario: SDK Initialization and Setup
- **WHEN** the React application is booted with a valid `VITE_GROWTHBOOK_CLIENT_KEY` set
- **THEN** the GrowthBook client initializes with sticky bucketing, change subscription, and streaming features enabled, and is made available to all downstream components via the localized provider context.
