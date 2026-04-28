import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Note, Label } from '../shared/schemas.js'
import { EventEmitter } from 'node:events'

const DATA_FILE = path.resolve(process.env.DATA_DIR ?? './data', 'notes.json')

export const storeEvents = new EventEmitter()

function read(): Record<string, Note> {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    let migrated = false
    
    // Migrate legacy string labels to object labels
    for (const id in data) {
      const note = data[id]
      if (note.labels && note.labels.length > 0 && typeof note.labels[0] === 'string') {
        // @ts-expect-error - migrating legacy data
        note.labels = note.labels.map(l => ({ name: l, source: 'user' }))
        migrated = true
      }
    }
    
    // Auto-save the migrated data so it persists
    if (migrated) {
      const dir = path.dirname(DATA_FILE)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    }
    
    return data
  } catch {
    return {}
  }
}

function write(notes: Record<string, Note>): void {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2))
}

export function listNotes(): Note[] {
  return Object.values(read())
}

export function getNote(id: string): Note | undefined {
  return read()[id]
}

export function createNote(title = '', content = '', labels: Label[] = []): Note {
  const now = Date.now()
  const note: Note = {
    id: randomUUID(),
    title,
    content,
    labels,
    createdAt: now,
    updatedAt: now,
    openedAt: now,
    editCount: 0,
  }
  const notes = read()
  notes[note.id] = note
  write(notes)
  storeEvents.emit('note:created', note)
  return note
}

export function updateNote(id: string, fields: Partial<Pick<Note, 'title' | 'content'>>): Note | undefined {
  const notes = read()
  const note = notes[id]
  if (!note) return undefined
  if (fields.title !== undefined) note.title = fields.title
  if (fields.content !== undefined) {
    note.content = fields.content
    note.editCount += 1
  }
  note.updatedAt = Date.now()
  notes[id] = note
  write(notes)
  storeEvents.emit('note:updated', note)
  return note
}

export function deleteNote(id: string): boolean {
  const notes = read()
  if (!notes[id]) return false
  delete notes[id]
  write(notes)
  storeEvents.emit('note:deleted', id)
  return true
}

export function addLabel(id: string, name: string, source: "user" | "ai_auto" | "ai_suggested" = 'user'): Note | undefined {
  const notes = read()
  const note = notes[id]
  if (!note) return undefined
  if (!note.labels.some(l => l.name === name)) {
    note.labels.push({ name, source })
    note.updatedAt = Date.now()
    notes[id] = note
    write(notes)
    storeEvents.emit('note:updated', note)
  }
  return note
}

export function removeLabel(id: string, name: string): Note | undefined {
  const notes = read()
  const note = notes[id]
  if (!note) return undefined
  note.labels = note.labels.filter(l => l.name !== name)
  note.updatedAt = Date.now()
  notes[id] = note
  write(notes)
  storeEvents.emit('note:updated', note)
  return note
}

/**
 * Merges AI-generated labels into a note.
 * - Preserves all user labels.
 * - Removes stale ai_auto / ai_suggested labels that are no longer in the new set.
 * - Adds new ai_auto / ai_suggested labels.
 * - Emits 'note:updated' WITHOUT re-triggering the taxonomy listener (handled in listeners.ts).
 */
export function setAiLabels(
  id: string,
  autoLabels: string[],
  suggestedLabels: string[]
): Note | undefined {
  const notes = read()
  const note = notes[id]
  if (!note) return undefined

  // Keep all user labels
  const userLabels = note.labels.filter(l => l.source === 'user')

  const newAiAuto: Label[] = autoLabels.map(name => ({ name, source: 'ai_auto' }))
  const newAiSuggested: Label[] = suggestedLabels.map(name => ({ name, source: 'ai_suggested' }))

  note.labels = [...userLabels, ...newAiAuto, ...newAiSuggested]
  note.updatedAt = Date.now()
  notes[id] = note
  write(notes)
  storeEvents.emit('note:ai_updated', note)
  return note
}

export function searchNotes(query: string): Note[] {
  const q = query.toLowerCase()
  return listNotes().filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.labels.some(l => l.name.toLowerCase().includes(q))
  )
}
