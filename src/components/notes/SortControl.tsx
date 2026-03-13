import { useNoteStore } from '../../store/useNoteStore'
import type { SortMode } from '../../types/note'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'updatedAt', label: 'Last edited' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title A–Z' },
]

export function SortControl() {
  const { sortMode, setSortMode } = useNoteStore()

  return (
    <select
      value={sortMode}
      onChange={e => setSortMode(e.target.value as SortMode)}
      className="bg-transparent text-xs text-zinc-400 outline-none cursor-pointer hover:text-zinc-700 transition-colors -mr-1"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-white text-zinc-900">
          {opt.label}
        </option>
      ))}
    </select>
  )
}
