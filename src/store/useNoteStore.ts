import { create } from 'zustand'
import type { Note, SortMode, LifecycleFilter } from '../types/note'

interface NoteStore {
  notes: Record<string, Note>
  activeNoteId: string | null
  selectedIds: Set<string>
  searchQuery: string
  sortMode: SortMode
  lifecycleFilter: LifecycleFilter
  activeLabelFilter: string | null
  loaded: boolean

  fetchNotes: () => Promise<void>
  createNote: () => Promise<string>
  updateNote: (id: string, content: string) => void
  updateTitle: (id: string, title: string) => void
  deleteNote: (id: string) => void
  deleteNotes: (ids: string[]) => void
  setActiveNote: (id: string | null) => void
  toggleSelected: (id: string) => void
  clearSelection: () => void
  addLabel: (id: string, label: string) => void
  removeLabel: (id: string, label: string) => void
  suggestTags: (id: string) => Promise<{ existing: string[], new: string[] }>
  setSearchQuery: (q: string) => void
  setSortMode: (mode: SortMode) => void
  setLifecycleFilter: (f: LifecycleFilter) => void
  setActiveLabelFilter: (label: string | null) => void
}

const api = (path: string, opts?: RequestInit) =>
  fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })

export const useNoteStore = create<NoteStore>()((set, get) => ({
  notes: {},
  activeNoteId: null,
  selectedIds: new Set<string>(),
  searchQuery: '',
  sortMode: 'updatedAt',
  lifecycleFilter: 'all',
  activeLabelFilter: null,
  loaded: false,

  fetchNotes: async () => {
    const res = await api('/notes')
    const list: Note[] = await res.json()
    const notes: Record<string, Note> = {}
    for (const n of list) notes[n.id] = n
    set({ notes, loaded: true })
  },

  createNote: async () => {
    const res = await api('/notes', { method: 'POST', body: JSON.stringify({}) })
    const note: Note = await res.json()
    set(s => ({ notes: { ...s.notes, [note.id]: note } }))
    return note.id
  },

  updateNote: (id, content) => {
    // Optimistic update, then persist
    set(s => {
      const note = s.notes[id]
      if (!note) return s
      return {
        notes: {
          ...s.notes,
          [id]: { ...note, content, updatedAt: Date.now(), editCount: note.editCount + 1 },
        },
      }
    })
    api(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) })
  },

  updateTitle: (id, title) => {
    set(s => {
      const note = s.notes[id]
      if (!note) return s
      return { notes: { ...s.notes, [id]: { ...note, title, updatedAt: Date.now() } } }
    })
    api(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) })
  },

  deleteNote: (id) => {
    set(s => {
      const { [id]: _, ...rest } = s.notes
      return {
        notes: rest,
        activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
      }
    })
    api(`/notes/${id}`, { method: 'DELETE' })
  },

  deleteNotes: (ids) => {
    set(s => {
      const notes = { ...s.notes }
      for (const id of ids) delete notes[id]
      return {
        notes,
        activeNoteId: s.activeNoteId && ids.includes(s.activeNoteId) ? null : s.activeNoteId,
        selectedIds: new Set<string>(),
      }
    })
    for (const id of ids) api(`/notes/${id}`, { method: 'DELETE' })
  },

  setActiveNote: (id) => {
    if (id) {
      set(s => ({
        activeNoteId: id,
        notes: s.notes[id]
          ? { ...s.notes, [id]: { ...s.notes[id], openedAt: Date.now() } }
          : s.notes,
      }))
    } else {
      set({ activeNoteId: null })
    }
  },

  toggleSelected: (id) => {
    set(s => {
      const next = new Set(s.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    })
  },

  clearSelection: () => set({ selectedIds: new Set<string>() }),

  addLabel: (id, label) => {
    set(s => {
      const note = s.notes[id]
      if (!note || note.labels.some(l => l.name === label)) return s
      return {
        notes: { ...s.notes, [id]: { ...note, labels: [...note.labels, { name: label, source: 'user' }] } },
      }
    })
    api(`/notes/${id}/labels`, { method: 'POST', body: JSON.stringify({ name: label, source: 'user' }) })
  },

  removeLabel: (id, label) => {
    set(s => {
      const note = s.notes[id]
      if (!note) return s
      return {
        notes: { ...s.notes, [id]: { ...note, labels: note.labels.filter(l => l.name !== label) } },
      }
    })
    api(`/notes/${id}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' })
  },

  suggestTags: async (id: string) => {
    const res = await api(`/notes/${id}/suggest-tags`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to suggest tags')
    return res.json()
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setLifecycleFilter: (f) => set({ lifecycleFilter: f }),
  setActiveLabelFilter: (label) => set({ activeLabelFilter: label }),
}))
