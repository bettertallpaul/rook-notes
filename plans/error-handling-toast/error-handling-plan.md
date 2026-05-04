# Error Handling Implementation Plan

This plan outlines the steps to implement a centralized, toast-based error handling system using Sonner, specifically addressing the AI tag suggestion feature. It relies on the architectural principle of bubbling raw errors from the backend directly to the UI, completely avoiding complex error code parsing.

## 1. Backend: Surface Raw Errors
- [x] **`src/server/ai/taxonomy.ts`**: Remove the `catch` block that suppresses AI errors and silently returns `[]`. Instead, `throw` the error (and explicitly throw `AbortError` on timeout) so it bubbles up to the Express route handler.

## 2. Store: Pass Detailed Errors to UI
- [x] **`src/store/useNoteStore.ts`**: Update the `suggestTags` method. Modify the existing `!res.ok` trap to parse the JSON response body and throw an `Error` containing the backend's explicit `details` or `error` string, replacing the current generic `"Failed to suggest tags"` message.
- [x] 🛑 **CHECKPOINT 1**: Confirm with the user that the backend now properly bubbles errors to the store before touching the UI.

## 3. UI Setup: Global Toast Context
- [x] **Install Dependency**: Add `sonner` to the project (e.g., `pnpm install sonner`).
- [x] **`src/main.tsx`**: Import the `<Toaster />` component from `sonner` and add it near the root of your application tree to enable global toast notifications.
- [x] 🛑 **CHECKPOINT 2**: Confirm with the user that the dependency installed correctly and the app still builds/runs.

## 4. UI Implementation: Display Contextual Toasts
- [x] **`src/components/notes/LabelEditor.tsx`**: Import `toast` from `sonner`.
- [x] **Handle Error State**: In the `catch` block of `handleSuggestTags`, replace the generic console log with `toast.error(err.message)`.
- [x] **Handle Empty State**: In the `try` block of `handleSuggestTags`, after filtering results, add an empty-state check. If `existing.length === 0 && new.length === 0`, call `toast.info('No new tags suggested.')` so the user knows the AI succeeded but found nothing.
- [x] 🛑 **CHECKPOINT 3**: Final confirmation that toasts appear correctly in the browser.
