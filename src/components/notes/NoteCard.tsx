import type { Note } from '../../types/note'
import { getTitle, getSnippet, isStale, formatTimestamp } from '../../lib/noteUtils'
import clsx from 'clsx'

interface NoteCardProps {
  note: Note
  selected?: boolean
  onClick: (e: React.MouseEvent) => void
}

function SparkleIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 text-violet-400"
    >
      <path d="M12 2l2.09 6.26L20 9.27l-5 4.87 1.18 6.88L12 17.77l-4.18 3.25L9 14.14 4 9.27l5.91-.91L12 2z" />
    </svg>
  )
}

export function NoteCard({ note, selected, onClick }: NoteCardProps) {
  const hasTitle = note.title !== undefined
  const title = hasTitle ? (note.title || 'Untitled') : getTitle(note.content)
  const snippet = getSnippet(note.content, 140, !hasTitle)
  const stale = isStale(note)

  // Show user + ai_auto labels on card; hide ai_suggested to keep card clean
  const visibleLabels = note.labels.filter(l => l.source !== 'ai_suggested')
  const hasSuggested = note.labels.some(l => l.source === 'ai_suggested')

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative group w-full text-left px-4 py-3 transition-colors',
        stale && 'opacity-50',
        selected && 'bg-red-50 ring-1 ring-inset ring-red-200'
      )}
    >
      <div className="absolute inset-y-0 left-4 right-4 group-hover:bg-gray-50 transition-colors" />
      <div className="relative px-2">
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

        {(visibleLabels.length > 0 || hasSuggested) && (
          <div className="mt-1.5 flex flex-wrap gap-1 items-center">
            {visibleLabels.map(labelObj => (
              <span
                key={labelObj.name}
                className={clsx(
                  'flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded',
                  labelObj.source === 'ai_auto'
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-red-50 text-red-600'
                )}
              >
                {labelObj.source === 'ai_auto' && <SparkleIcon />}
                {labelObj.name}
              </span>
            ))}
            {hasSuggested && (
              <span
                className="flex items-center gap-0.5 text-xs text-violet-400"
                title="AI has suggestions — open note to review"
              >
                <SparkleIcon />
                <span className="text-[10px]">suggestions</span>
              </span>
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-4 right-4 border-b border-gray-200" />
    </button>
  )
}
