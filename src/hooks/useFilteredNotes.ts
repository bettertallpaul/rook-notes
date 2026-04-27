import { useMemo } from 'react'
import type { Note, SortMode, LifecycleFilter } from '../types/note'
import { getTitle, isStale, isRecent } from '../lib/noteUtils'

export function useFilteredNotes(
  notes: Record<string, Note>,
  searchQuery: string,
  sortMode: SortMode,
  lifecycleFilter: LifecycleFilter,
  activeLabelFilter: string | null
): Note[] {
  return useMemo(() => {
    let result = Object.values(notes)

    if (activeLabelFilter) {
      result = result.filter(n => n.labels.some(l => l.name === activeLabelFilter))
    }

    if (lifecycleFilter === 'recent') {
      result = result.filter(isRecent)
    } else if (lifecycleFilter === 'stale') {
      result = result.filter(isStale)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        n =>
          (n.title ?? '').toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.labels.some(l => l.name.toLowerCase().includes(q))
      )
    }

    const resolveTitle = (n: Note) =>
      n.title !== undefined ? (n.title || 'Untitled') : getTitle(n.content)

    result.sort((a, b) => {
      if (sortMode === 'updatedAt') return b.updatedAt - a.updatedAt
      if (sortMode === 'createdAt') return b.createdAt - a.createdAt
      if (sortMode === 'title') return resolveTitle(a).localeCompare(resolveTitle(b))
      return 0
    })

    return result
  }, [notes, searchQuery, sortMode, lifecycleFilter, activeLabelFilter])
}
