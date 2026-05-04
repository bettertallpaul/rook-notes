# AI Suggestion UX Updates

## Original UX State
Current state:
- default state showing preselected tag in red, applied by end user
- recommended tags in purple after clicking "suggest tags"
- solid purple: recommended tags that already exist in the system
- dashed purple: recommended tags that don't exist in the system

## Implementation Plan

- [X] **1. Unified Inline Layout:** Bring all tags (applied and suggested) and the 'Suggest Tags' button into a single, naturally wrapping horizontal flow.
- [X] **2. Component Ordering:**
    - The flow is now: `[Applied Tags]` -> `[Input Field]` -> `[Suggested Tags]` -> `[Suggest Tags Button]`. 
    - As tags are added or suggested, the button simply flows inline and gets pushed naturally.
- [X] **3. Button Visual Hierarchy:**
    - Redesigned the 'Suggest Tags' button as a distinct secondary action.
    - Matched 'New note' button styling (8px border-radius, `text-sm font-medium`).
    - Rendered as a ghost/secondary button with transparent background.
- [X] **4. Iconography and State Fixes:**
    - [X] Replaced the literal asterisk `*` in new suggested tags and the button with unicode sparkle `✨`.
    - [X] Removed trailing `×` from ALL purple suggested tags.
    - [X] Added leading `+` to all suggested tags to indicate they are opt-in.
- [X] **5. Language Consistency:**
    - [X] Renamed "Add labels..." to "Add tags...".
    - [X] Updated UI strings (Sidebar, aria-labels) to use "Tags" instead of "Labels".
- [X] **6. Persistent Input Affordance:**
    - [X] The "Add tags..." placeholder is now always visible, even when tags are applied.
    - [X] Positioned the input field immediately after user-added tags for a natural flow.

## UX Iteration

### 1. Clarify the "Add tags..." Input Field ("Ghost Tag" Pattern)
**Goal:** Make the text input area look like an interactive part of the tag list rather than floating text.

* **Styling:** Style the "Add tags..." input just like the other standard applied tags. 
* **Border:** Use a subtle border (e.g., a light gray solid line or a dashed line) to indicate it is an empty container waiting to be filled. 
* **Placeholder Text:** Update the placeholder text to `+ Add a new tag...` or `+ Add tag`.
* **Focus State:** When the user clicks into the input field to type, slightly darken the border or add a subtle focus ring to indicate it is active.

### 2. Strengthen Button Affordances (Subtle Boundaries)
**Goal:** Ensure the "Suggest Tags" button is clearly identifiable as a clickable element before the user hovers over it.

* **Default State:** Give the "Suggest Tags" button a permanent visual container. Use either a very light gray background pill (`bg-gray-50` or similar) or a 1px soft border that matches your application's light border theme.
* **Hover State:** Retain the current behavior—darken the background slightly on hover to provide standard interactive feedback.

### 3. Tame the Layout Shift (Dedicated Row)
**Goal:** Prevent the UI and button from jumping around horizontally when the AI generates multiple tags.

* **Placement:** When the user clicks "Suggest Tags", render the resulting purple suggestion tags in a completely new row (a new `div` or flex-container) positioned directly *below* the main input/tag row. 
* **Alignment:** Left-align the suggested tags so they sit neatly beneath the active input area.
* **Animation (Optional but recommended):** Use a quick, smooth accordion drop-down animation (e.g., 150-200ms) to reveal the new row, making the appearance feel intentional rather than abrupt.

### 4. Provide Explicit Dismissal (Toggle Button State)
**Goal:** Give users a clear, explicit way to clear the AI suggestions without having to interact with the input field.

* **Active State:** When the suggested tags row is visible, dynamically change the "Suggest Tags" button.
* **Text/Icon Update:** Change the text from "Suggest Tags" to "Clear Suggestions" (or just "Clear"). Swap the ✨ icon for a small `x` or a close icon.
* **Action:** When the user clicks "Clear Suggestions", remove the dedicated row of suggested tags and revert the button back to its default "✨ Suggest Tags" state. 
* **Implicit Dismissal (Retained):** Continue with your plan to automatically clear the suggestions and reset the button if the user begins manually typing a new tag in the input field.