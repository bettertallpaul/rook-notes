import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Note } from '../shared/schemas.js'

const DATA_FILE = path.resolve(process.env.DATA_DIR ?? './data', 'notes.json')

function read(): Record<string, Note> {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
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

export function createNote(title = '', content = '', labels: string[] = []): Note {
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
  return note
}

export function deleteNote(id: string): boolean {
  const notes = read()
  if (!notes[id]) return false
  delete notes[id]
  write(notes)
  return true
}

export function addLabel(id: string, label: string): Note | undefined {
  const notes = read()
  const note = notes[id]
  if (!note) return undefined
  if (!note.labels.includes(label)) {
    note.labels.push(label)
    note.updatedAt = Date.now()
    notes[id] = note
    write(notes)
  }
  return note
}

export function removeLabel(id: string, label: string): Note | undefined {
  const notes = read()
  const note = notes[id]
  if (!note) return undefined
  note.labels = note.labels.filter(l => l !== label)
  note.updatedAt = Date.now()
  notes[id] = note
  write(notes)
  return note
}

export function searchNotes(query: string): Note[] {
  const q = query.toLowerCase()
  return listNotes().filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.labels.some(l => l.toLowerCase().includes(q))
  )
}
