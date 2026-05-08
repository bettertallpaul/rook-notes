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

- [X] **1. Clarify the "Add tags..." Input Field ("Ghost Tag" Pattern):**
    - **Styling:** Styled the input to mirror red applied tags (`bg-red-50/50`, `text-red-600`).
    - **Border:** Added a dashed red border to match the "suggested" visual language.
    - **Placeholder Text:** Updated to `+ Add tag`.
    - **Sizing:** Unified sizing with `px-2.5 py-1` and `w-24` width.
- [X] **2. Strengthen Button Affordances (Subtle Boundaries):**
    - **Default State:** Switched to a clean, transparent background (`bg-transparent`) for a lighter visual profile.
    - **Sizing:** Reduced to `text-xs` and `px-2.5 py-1` to match the tag scale perfectly.
- [X] **3. Tame the Layout Shift (Dedicated Row):**
    - **Placement:** Results now render in a new row directly below the input, preventing horizontal jumps.
    - **Alignment:** Left-aligned beneath the active input area.
- [X] **4. Provide Explicit Dismissal (Toggle Button State):**
    - **Active State:** Button text dynamically changes to "Clear" when suggestions are visible.
    - **Iconography:** Preserved the ✨ icon in both states for brand consistency.
    - **Implicit Dismissal:** Typing in the input field automatically clears the suggestion row.