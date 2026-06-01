import { useRef, useCallback } from 'react'
import { useNoteStore } from '../../store/useNoteStore'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useNoteStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const focusSearch = useCallback(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useKeyboardShortcut('k', focusSearch, { meta: true })

  return (
    <div className="px-3 py-[15px] bg-gray-50 shrink-0">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setSearchQuery('')
              inputRef.current?.blur()
            }
          }}
          placeholder="Search… (⌘K)"
          className="w-full bg-gray-200 text-zinc-900 placeholder-zinc-400 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-red-400 transition"
        />
      </div>
    </div>
  )
}
