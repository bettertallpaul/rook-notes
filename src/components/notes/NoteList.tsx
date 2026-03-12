import { useEffect, useCallback } from 'react'
import { useNoteStore } from '../../store/useNoteStore'
import { useFilteredNotes } from '../../hooks/useFilteredNotes'
import { NoteCard } from './NoteCard'
import { SortControl } from './SortControl'

export function NoteList() {
  const {
    notes,
    searchQuery,
    sortMode,
    lifecycleFilter,
    activeLabelFilter,
    selectedIds,
    setActiveNote,
    createNote,
    toggleSelected,
    clearSelection,
    deleteNotes,
  } = useNoteStore()

  const filtered = useFilteredNotes(notes, searchQuery, sortMode, lifecycleFilter, activeLabelFilter)

  const handleNewNote = async () => {
    const id = await createNote()
    setActiveNote(id)
  }

  const handleClick = (id: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      toggleSelected(id)
    } else {
      if (selectedIds.size > 0) {
        clearSelection()
      }
      setActiveNote(id)
    }
  }

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return
    const ids = [...selectedIds]
    if (confirm(`Delete ${ids.length} note${ids.length > 1 ? 's' : ''}?`)) {
      deleteNotes(ids)
    }
  }, [selectedIds, deleteNotes])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
        e.preventDefault()
        handleDeleteSelected()
      }
      if (e.key === 'Escape' && selectedIds.size > 0) {
        clearSelection()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIds, handleDeleteSelected, clearSelection])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 shrink-0">
        <span className="text-xs text-zinc-400">
          {selectedIds.size > 0
            ? `${selectedIds.size} selected`
            : `${filtered.length} ${filtered.length === 1 ? 'note' : 'notes'}`}
        </span>
        <SortControl />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-24">
            <p className="text-sm">No notes</p>
            <button
              onClick={handleNewNote}
              className="mt-2 text-sm text-red-600 hover:text-red-500 transition-colors cursor-pointer"
            >
              Create one
            </button>
          </div>
        ) : (
          filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              selected={selectedIds.has(note.id)}
              onClick={(e) => handleClick(note.id, e)}
            />
          ))
        )}
      </div>
    </div>
  )
}
