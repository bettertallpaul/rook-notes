import { storeEvents } from '../store.js'
import type { Note } from '../../shared/schemas.js'

const taxonomyDebounceTimers = new Map<string, NodeJS.Timeout>()

export function registerListeners() {
  storeEvents.on('note:updated', (note: Note) => {
    const existing = taxonomyDebounceTimers.get(note.id)
    if (existing) clearTimeout(existing)

    taxonomyDebounceTimers.set(
      note.id,
      setTimeout(() => {
        taxonomyDebounceTimers.delete(note.id)
        // TODO (Phase 3): Trigger Vercel AI SDK taxonomy generation here
        console.log(`[TaskManager] Debounced auto-taxonomy job triggered for note: ${note.id}`)
      }, 2000)
    )
  })

  storeEvents.on('note:created', (note: Note) => {
    taxonomyDebounceTimers.set(
      note.id,
      setTimeout(() => {
        taxonomyDebounceTimers.delete(note.id)
        // TODO (Phase 3): Trigger Vercel AI SDK taxonomy generation here
        console.log(`[TaskManager] Auto-taxonomy job triggered for new note: ${note.id}`)
      }, 2000)
    )
  })
}
