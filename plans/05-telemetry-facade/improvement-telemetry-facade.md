Here is a summary of your core architectural options for decoupling telemetry in the Rook Notes frontend client, ordered from the most decoupled to the most centralized.

### 1. Pure Facade at the Component Level (UI-Driven)

Your React components handle telemetry explicitly based on user interactions, leaving your state management completely untouched.

* **How it works:** You create a single `Telemetry.track()` service. Your components (e.g., `LabelEditor.tsx`) call this service when a user clicks a button or accepts an AI suggestion, and *then* they call the Zustand store to update the UI.


* **Pros:** Keeps `useNoteStore.ts` 100% focused on state management. It perfectly handles optimistic updates because the event is tied to the user's click, not the resulting server-sent event (SSE) invalidation.


* **Cons:** Tracking logic is scattered across multiple React components, which can lead to missed events if the UI grows in complexity.

### 2. The Hybrid: Pub-Sub + Facade (Event-Driven)

You introduce a lightweight event broker (like `mitt`) so your app can announce events without knowing who is listening.

* **How it works:** Components or the store emit generic events (e.g., `eventBus.emit('label_added')`). A separate `telemetry.ts` file listens for these events and routes them to active providers like GrowthBook or GA4.


* **Pros:** Achieves total decoupling. Your core logic never imports a telemetry library. Swapping or adding providers happens entirely in one isolated listener file.
* **Cons:** Requires introducing a new pattern (event emitter) into the codebase, adding a slight layer of abstraction to trace when debugging.

### 3. Pure Facade at the Store Level (Centralized State)

You replace direct GrowthBook imports with a custom internal telemetry service, but keep the tracking calls inside your Zustand actions.

* **How it works:** You build a `Telemetry.track()` wrapper. You import it directly into `useNoteStore.ts` and call it alongside your state updates (e.g., when `note_created` or `search` is triggered).


* **Pros:** Extremely fast to implement from your current state. Centralizes all tracking inside your existing state actions.
* **Cons:** Leaves the Zustand store "chatty" by mixing side-effects with state management. It remains vulnerable to false positives if an optimistic update is rejected by the Express API.



### 4. Zustand Subscriptions (The Outside Observer)

You leverage Zustand's native ability to be monitored from outside the React tree.

* **How it works:** You create a separate listener file that subscribes to the Zustand store. It compares the `previousState` to the `currentState` and deduces if an event should be fired (e.g., detecting if the note count increased).
* **Pros:** Requires absolutely zero changes to your existing components or your `useNoteStore.ts` logic.
* **Cons:** It is very difficult to reliably infer *why* a state changed (e.g., distinguishing whether a label was added by the user manually or via the Vercel AI SDK suggestions) simply by looking at a state diff.