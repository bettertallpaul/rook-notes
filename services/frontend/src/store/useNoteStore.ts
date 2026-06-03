import { create } from 'zustand'
import type { Note, SortMode, LifecycleFilter } from '../types/note'
import { trackEvent, trackSearchDebounced } from '../lib/growthbook'

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
  addLabel: (id: string, label: string, source?: 'user' | 'ai') => void
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
    trackEvent('note_created', { noteId: note.id })
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
    trackEvent('note_deleted', { noteId: id })
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
    for (const id of ids) {
      api(`/notes/${id}`, { method: 'DELETE' })
      trackEvent('note_deleted', { noteId: id })
    }
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

  addLabel: (id, label, source = 'user') => {
    set(s => {
      const note = s.notes[id]
      if (!note || note.labels.includes(label)) return s
      return {
        notes: { ...s.notes, [id]: { ...note, labels: [...note.labels, label] } },
      }
    })
    api(`/notes/${id}/labels`, { method: 'POST', body: JSON.stringify({ name: label }) })
    if (source === 'ai') {
      trackEvent('ai_tags_suggested', { noteId: id, label, source })
    }
    trackEvent('label_added', { noteId: id, label, source })
  },

  removeLabel: (id, label) => {
    set(s => {
      const note = s.notes[id]
      if (!note) return s
      return {
        notes: { ...s.notes, [id]: { ...note, labels: note.labels.filter(l => l !== label) } },
      }
    })
    api(`/notes/${id}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' })
    trackEvent('label_removed', { noteId: id, label })
  },

  suggestTags: async (id: string) => {
    const res = await api(`/notes/${id}/suggest-tags`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.details || data.error || 'Failed to suggest tags');
    }
    return res.json()
  },

  setSearchQuery: (q) => {
    set({ searchQuery: q })
    trackSearchDebounced(q)
  },
  setSortMode: (mode) => set({ sortMode: mode }),
  setLifecycleFilter: (f) => {
    set({ lifecycleFilter: f })
    trackEvent('lifecycle_filter_selected', { filter: f })
  },
  setActiveLabelFilter: (label) => {
    set({ activeLabelFilter: label })
    if (label !== null) {
      trackEvent('label_filter_selected', { label })
    }
  },
}))
