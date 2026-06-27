import { storeEvents, listNotes, getNote } from '../store.js'
import { suggestLabels } from '../ai/taxonomy.js'
import { config } from '@rook/shared'
import type { Note } from '@rook/shared'


/**
 * Classifies AI-returned label strings into:
 *  - autoLabels    → already exist in other notes (familiar term, safe to auto-apply)
 *  - suggestedLabels → novel to the corpus (surface as 1-click confirm)
 */
export function classifyLabels(newLabels: string[]): { autoLabels: string[]; suggestedLabels: string[] } {
  const allNotes = listNotes()
  const knownLabelNames = new Set(
    allNotes.flatMap(n => n.labels.map(l => l.toLowerCase()))
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


export function registerListeners() {
  if (!config.AI_ENABLED) {
    console.log('[AI] Intelligence features are disabled via AI_ENABLED=false')
    return
  }

  // NOTE: Automatic triggers disabled in Phase 4 (Opt-In Intelligence)
  /*
  storeEvents.on('note:created', (note: Note) => {
    scheduleJob(note, 2000)
  })

  storeEvents.on('note:updated', (note: Note) => {
    // Only trigger if there's meaningful content to classify
    if (!note.content?.trim() && !note.title?.trim()) return
    scheduleJob(note, 2000)
  })
  */

  // note:ai_updated is intentionally NOT handled here — prevents infinite loops
}
