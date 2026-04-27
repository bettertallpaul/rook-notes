import { useState, useRef, type KeyboardEvent } from 'react'
import { useNoteStore } from '../../store/useNoteStore'
import type { Label } from '../../types/note'

interface LabelEditorProps {
  noteId: string
  labels: Label[]
}

export function LabelEditor({ noteId, labels }: LabelEditorProps) {
  const { addLabel, removeLabel, notes } = useNoteStore()
  const [input, setInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allLabels = [...new Set(
    Object.values(notes).flatMap(n => n.labels.map(l => l.name))
  )].sort()

  const suggestions = input.trim()
    ? allLabels.filter(l => l.toLowerCase().includes(input.toLowerCase()) && !labels.some(lbl => lbl.name === l))
    : []

  const commitLabel = (value = input) => {
    const label = value.trim().replace(/,+$/, '')
    if (label) {
      addLabel(noteId, label)
      setInput('')
      setHighlightedIndex(0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Escape') {
        setInput('')
        return
      }
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (suggestions.length > 0 && e.key === 'Enter') {
        commitLabel(suggestions[highlightedIndex])
      } else {
        commitLabel()
      }
    } else if (e.key === 'Backspace' && !input && labels.length > 0) {
      removeLabel(noteId, labels[labels.length - 1].name)
    }
  }

  return (
    <div className="relative flex-1">
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-[24px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {labels.map(labelObj => (
          <span
            key={labelObj.name}
            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded"
          >
            {labelObj.name}
            <button
              onClick={e => {
                e.stopPropagation()
                removeLabel(noteId, labelObj.name)
              }}
              className="text-zinc-400 hover:text-zinc-600 transition-colors leading-none cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setHighlightedIndex(0) }}
          onKeyDown={handleKeyDown}
          onBlur={() => { commitLabel(); }}
          placeholder={labels.length === 0 ? 'Add labels…' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-zinc-500 placeholder-zinc-400 outline-none"
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded shadow-sm min-w-[160px] py-0.5">
          {suggestions.map((s, i) => (
            <li
              key={s}
              onMouseDown={e => { e.preventDefault(); commitLabel(s) }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`px-3 py-1.5 text-xs cursor-pointer ${
                i === highlightedIndex ? 'bg-gray-100 text-zinc-900' : 'text-zinc-600'
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
