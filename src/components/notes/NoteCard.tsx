import type { Note } from '../../types/note'
import { getTitle, getSnippet, isStale, formatTimestamp } from '../../lib/noteUtils'
import clsx from 'clsx'

interface NoteCardProps {
  note: Note
  selected?: boolean
  onClick: (e: React.MouseEvent) => void
}

export function NoteCard({ note, selected, onClick }: NoteCardProps) {
  const hasTitle = note.title !== undefined
  const title = hasTitle ? (note.title || 'Untitled') : getTitle(note.content)
  const snippet = getSnippet(note.content, 140, !hasTitle)
  const stale = isStale(note)

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
        stale && 'opacity-50',
        selected && 'bg-red-50 ring-1 ring-inset ring-red-200'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={clsx(
            'font-medium text-sm truncate leading-snug',
            stale ? 'text-zinc-400' : 'text-zinc-900'
          )}
        >
          {title}
        </span>
        <span className="shrink-0 text-xs text-zinc-400 mt-0.5">
          {formatTimestamp(note.updatedAt)}
        </span>
      </div>

      {snippet && (
        <p className="mt-0.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{snippet}</p>
      )}

      {note.labels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {note.labels.map(label => (
            <span
              key={label}
              className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="absolute bottom-0 left-4 right-0 border-b border-gray-200" />
    </button>
  )
}
