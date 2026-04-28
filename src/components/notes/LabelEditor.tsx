import { useState, useRef, type KeyboardEvent } from 'react'
import { useNoteStore } from '../../store/useNoteStore'
import type { Label } from '../../types/note'

interface LabelEditorProps {
  noteId: string
  labels: Label[]
}

/** Sparkle icon — marks AI-auto-applied labels */
function SparkleIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 text-violet-400"
    >
      <path d="M12 2l2.09 6.26L20 9.27l-5 4.87 1.18 6.88L12 17.77l-4.18 3.25L9 14.14 4 9.27l5.91-.91L12 2z" />
    </svg>
  )
}

/** Check icon — for confirm button */
function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function LabelEditor({ noteId, labels }: LabelEditorProps) {
  const { addLabel, removeLabel, notes } = useNoteStore()
  const [input, setInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const userAndAutoLabels = labels.filter(l => l.source !== 'ai_suggested')
  const suggestedLabels = labels.filter(l => l.source === 'ai_suggested')

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

  const confirmSuggested = (name: string) => {
    // Promote ai_suggested → user by removing & re-adding as user
    removeLabel(noteId, name)
    addLabel(noteId, name)
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
    } else if (e.key === 'Backspace' && !input && userAndAutoLabels.length > 0) {
      const last = userAndAutoLabels[userAndAutoLabels.length - 1]
      if (last.source === 'user') removeLabel(noteId, last.name)
    }
  }

  return (
    <div className="flex-1">
      {/* Applied labels row */}
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1.5 min-h-[24px] cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {userAndAutoLabels.map(labelObj => (
            <span
              key={labelObj.name}
              title={labelObj.source === 'ai_auto' ? 'Applied by AI' : undefined}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${
                labelObj.source === 'ai_auto'
                  ? 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {labelObj.source === 'ai_auto' && <SparkleIcon />}
              {labelObj.name}
              <button
                onClick={e => {
                  e.stopPropagation()
                  removeLabel(noteId, labelObj.name)
                }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors leading-none cursor-pointer"
                aria-label={`Remove label ${labelObj.name}`}
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
            onBlur={() => { commitLabel() }}
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

      {/* AI Suggested labels — 1-click confirmation */}
      {suggestedLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <SparkleIcon />
            Suggested:
          </span>
          {suggestedLabels.map(labelObj => (
            <span
              key={labelObj.name}
              className="flex items-center gap-1 text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded ring-1 ring-inset ring-violet-200 ring-dashed"
            >
              {labelObj.name}
              <button
                onClick={() => confirmSuggested(labelObj.name)}
                title="Confirm this label"
                className="text-violet-500 hover:text-violet-700 transition-colors cursor-pointer"
                aria-label={`Confirm label ${labelObj.name}`}
              >
                <CheckIcon />
              </button>
              <button
                onClick={() => removeLabel(noteId, labelObj.name)}
                title="Dismiss"
                className="text-zinc-400 hover:text-zinc-600 transition-colors leading-none cursor-pointer"
                aria-label={`Dismiss suggestion ${labelObj.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
