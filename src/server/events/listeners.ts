import { storeEvents, listNotes, setAiLabels, getNote } from '../store.js'
import { suggestLabels } from '../ai/taxonomy.js'
import type { Note } from '../../shared/schemas.js'

const taxonomyDebounceTimers = new Map<string, NodeJS.Timeout>()

/**
 * Classifies AI-returned label strings into:
 *  - autoLabels    → already exist in other notes (familiar term, safe to auto-apply)
 *  - suggestedLabels → novel to the corpus (surface as 1-click confirm)
 */
function classifyLabels(newLabels: string[]): { autoLabels: string[]; suggestedLabels: string[] } {
  const allNotes = listNotes()
  const knownLabelNames = new Set(
    allNotes.flatMap(n => n.labels.map(l => l.name.toLowerCase()))
  )

  const autoLabels: string[] = []
  const suggestedLabels: string[] = []

  for (const label of newLabels) {
    if (knownLabelNames.has(label.toLowerCase())) {
      autoLabels.push(label)
    } else {
      suggestedLabels.push(label)
    }
  }

  return { autoLabels, suggestedLabels }
}

async function runTaxonomyJob(note: Note) {
  console.log(`[TaskManager] Running taxonomy for note: ${note.id}`)

  // Re-fetch the note fresh from disk to avoid stale closures
  const freshNote = getNote(note.id)
  if (!freshNote) return

  const existingUserLabels = freshNote.labels
    .filter(l => l.source === 'user')
    .map(l => l.name)

  const suggestions = await suggestLabels(
    freshNote.content,
    freshNote.title,
    existingUserLabels
  )

  if (suggestions.length === 0) {
    console.log(`[TaskManager] No labels returned for note: ${note.id}`)
    return
  }

  const { autoLabels, suggestedLabels } = classifyLabels(suggestions)
  console.log(`[TaskManager] note:${note.id} → auto: [${autoLabels}] suggested: [${suggestedLabels}]`)

  setAiLabels(note.id, autoLabels, suggestedLabels)
}

function scheduleJob(note: Note, delayMs = 2000) {
  const existing = taxonomyDebounceTimers.get(note.id)
  if (existing) clearTimeout(existing)

  taxonomyDebounceTimers.set(
    note.id,
    setTimeout(() => {
      taxonomyDebounceTimers.delete(note.id)
      runTaxonomyJob(note).catch(err => {
        console.error(`[TaskManager] Taxonomy job failed for note: ${note.id}`, err)
      })
    }, delayMs)
  )
}

export function registerListeners() {
  storeEvents.on('note:created', (note: Note) => {
    scheduleJob(note, 2000)
  })

  storeEvents.on('note:updated', (note: Note) => {
    // Only trigger if there's meaningful content to classify
    if (!note.content?.trim() && !note.title?.trim()) return
    scheduleJob(note, 2000)
  })

  // note:ai_updated is intentionally NOT handled here — prevents infinite loops
}
