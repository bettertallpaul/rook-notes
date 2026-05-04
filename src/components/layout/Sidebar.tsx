import { useMemo } from 'react'
import { useNoteStore } from '../../store/useNoteStore'
import type { LifecycleFilter } from '../../types/note'
import clsx from 'clsx'
import rookLogo from '../../../assetts/rook-logo-red.svg'

const LIFECYCLE_OPTIONS: { value: LifecycleFilter; label: string }[] = [
  { value: 'all', label: 'All Notes' },
  { value: 'recent', label: 'Recent' },
  { value: 'stale', label: 'Stale' },
]

export function Sidebar() {
  const { notes, activeLabelFilter, lifecycleFilter, setActiveLabelFilter, setLifecycleFilter, createNote, setActiveNote } =
    useNoteStore()

  const labels = useMemo(() => {
    const all = Object.values(notes).flatMap(n => n.labels.map(l => l.name))
    return [...new Set(all)].sort()
  }, [notes])

  const handleNewNote = async () => {
    const id = await createNote()
    setActiveNote(id)
  }

  return (
    <aside className="w-56 h-full bg-gray-50 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={() => { setActiveNote(null); setLifecycleFilter('all'); setActiveLabelFilter(null) }}
          className="flex items-center gap-2 mb-4 cursor-pointer"
        >
          <img src={rookLogo} alt="Rook" className="h-[30px] w-auto" />
          <h1 className="text-[30px] font-semibold tracking-tight text-zinc-900 leading-none">Rook</h1>
        </button>
        <button
          onClick={handleNewNote}
          className="w-full flex items-center justify-center gap-1.5 bg-[#E14A34] hover:bg-red-500 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New note
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <div className="mb-4 mx-2">
          <p className="px-3 mb-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Views
          </p>
          {LIFECYCLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setLifecycleFilter(opt.value)
                setActiveLabelFilter(null)
              }}
              className={clsx(
                'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5 pl-4',
                lifecycleFilter === opt.value && !activeLabelFilter
                  ? 'bg-gray-200 text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-gray-100'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {labels.length > 0 && (
          <div className="mx-2">
            <p className="px-3 mb-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Tags
            </p>
            {labels.map(label => (
              <button
                key={label}
                onClick={() =>
                  setActiveLabelFilter(activeLabelFilter === label ? null : label)
                }
                className={clsx(
                  'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5 truncate pl-4',
                  activeLabelFilter === label
                    ? 'bg-red-50 text-red-600'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-gray-100'
                )}
              >
                <span className="text-zinc-400 mr-1">#</span>
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}
