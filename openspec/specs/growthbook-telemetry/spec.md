# growthbook-telemetry Specification

## Purpose
TBD - created by archiving change gb-integration. Update Purpose after archive.

## Requirements

### Requirement: GrowthBook SDK Initialization
The frontend application SHALL initialize the GrowthBook React SDK client instance with:
- The client API key loaded from `VITE_GROWTHBOOK_CLIENT_KEY`.
- The `apiHost` set to `https://cdn.growthbook.io`.
- Enabled dev mode based on development environment context.
- Enabled sticky bucketing using the cookie-backed `BrowserCookieStickyBucketService`.
- Enabled subscription to real-time flag changes.
- A tracking callback that dispatches an `"Experiment Viewed"` event with `experimentId` and `variationId` properties when an experiment variation is evaluated.
- Enabled SDK plugins: `autoAttributesPlugin` and `growthbookTrackingPlugin` to handle automatic attribute targeting and streaming event tracking.
- The application root wrapped in `GrowthBookProvider`.

#### Scenario: SDK Initialization and Setup
- **WHEN** the React application is booted with a valid `VITE_GROWTHBOOK_CLIENT_KEY` set
- **THEN** the GrowthBook client initializes with sticky bucketing, change subscription, and streaming features enabled, and is made available to all downstream components via the provider context.

### Requirement: Application Lifecycle Telemetry
The application SHALL automatically record initial startup and page navigation events.

#### Scenario: Logging session startup and initial page view
- **WHEN** the React application is mounted for the first time
- **THEN** the system dispatches a `session_start` event followed by a `page_view` event to GrowthBook.

### Requirement: Note Creation and Deletion Telemetry
The application SHALL log events when notes are created or deleted.

#### Scenario: Creating a note
- **WHEN** the user creates a new note
- **THEN** the system dispatches a `note_created` event to GrowthBook with the new note's ID.

#### Scenario: Deleting a note
- **WHEN** the user deletes a note
- **THEN** the system dispatches a `note_deleted` event to GrowthBook with the target note's ID.

### Requirement: Label Management Telemetry
The application SHALL log events when labels are added or removed, specifying whether a label addition was done manually by the user or selected from AI suggestions.

#### Scenario: User manually adds a label
- **WHEN** the user manually types and submits a label on a note
- **THEN** the system dispatches a `label_added` event to GrowthBook with properties including the note ID, label string, and `{ source: 'user' }`.

#### Scenario: User accepts an AI-suggested label
- **WHEN** the user accepts an AI tag suggestion on a note
- **THEN** the system dispatches an `ai_tags_suggested` event and a `label_added` event to GrowthBook with properties including the note ID, label string, and `{ source: 'ai' }`.

#### Scenario: User removes a label
- **WHEN** the user removes an existing label from a note
- **THEN** the system dispatches a `label_removed` event to GrowthBook with properties including the note ID and label string.

### Requirement: Search and Filter Navigation Telemetry
The application SHALL log events when search inputs or sidebar filter selections change, utilizing debouncing on search queries to limit API call frequency.

#### Scenario: Sidebar lifecycle filter selection
- **WHEN** the user clicks on a sidebar lifecycle filter (e.g., Active, Archived, Trash)
- **THEN** the system dispatches a `lifecycle_filter_selected` event to GrowthBook with the selected filter name.

#### Scenario: Sidebar label filter selection
- **WHEN** the user clicks on a sidebar label filter
- **THEN** the system dispatches a `label_filter_selected` event to GrowthBook with the selected label name.

#### Scenario: Debounced search input
- **WHEN** the user types a query in the search input and ceases typing for a brief period
- **THEN** the system dispatches a single `search` event to GrowthBook containing the debounced query.
