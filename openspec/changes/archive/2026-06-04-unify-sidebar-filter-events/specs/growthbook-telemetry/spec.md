## MODIFIED Requirements

### Requirement: Search and Filter Navigation Telemetry
The application SHALL log events when search inputs or sidebar filter selections change, utilizing debouncing on search queries to limit API call frequency.

#### Scenario: Sidebar lifecycle filter selection
- **WHEN** the user clicks on a sidebar lifecycle filter (i.e., All Notes, Recent, or Stale)
- **THEN** the system dispatches a `sidebar_filter_selected` event to GrowthBook with `filterType` set to `"lifecycle"` and `filterValue` set to the selected filter value (`"all"`, `"recent"`, or `"stale"`).

#### Scenario: Sidebar label filter selection
- **WHEN** the user clicks on a sidebar label filter
- **THEN** the system dispatches a `sidebar_filter_selected` event to GrowthBook with `filterType` set to `"label"` (without `filterValue`).

#### Scenario: Debounced search input
- **WHEN** the user types a query in the search input and ceases typing for a brief period
- **THEN** the system dispatches a single `search` event to GrowthBook containing the debounced query.

### Requirement: Note Creation and Deletion Telemetry
The application SHALL log events when notes are created or deleted.

#### Scenario: Creating a note
- **WHEN** the user creates a new note
- **THEN** the system dispatches a `note_created` event to GrowthBook (with no note ID payload).

#### Scenario: Deleting a note
- **WHEN** the user deletes a note
- **THEN** the system dispatches a `note_deleted` event to GrowthBook (with no note ID payload).

### Requirement: Label Management Telemetry
The application SHALL log events when labels are added or removed, specifying whether a label addition was done manually by the user or selected from AI suggestions.

#### Scenario: User manually adds a label
- **WHEN** the user manually types and submits a label on a note
- **THEN** the system dispatches a `label_added` event to GrowthBook with properties including the label string and `{ source: 'user' }`.

#### Scenario: User accepts an AI-suggested label
- **WHEN** the user accepts an AI tag suggestion on a note
- **THEN** the system dispatches an `ai_tags_suggested` event and a `label_added` event to GrowthBook with properties including the label string and `{ source: 'ai' }`.

#### Scenario: User removes a label
- **WHEN** the user removes an existing label from a note
- **THEN** the system dispatches a `label_removed` event to GrowthBook with properties including the label string.
