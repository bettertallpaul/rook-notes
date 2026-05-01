import { useState, useRef, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
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
    </svg>)
}

export function LabelEditor({ noteId, labels }: LabelEditorProps) {
  const { addLabel, removeLabel, notes, suggestTags } = useNoteStore()
  const [input, setInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{ existing: string[], new: string[] } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // In Opt-In mode, only labels with source 'user' are considered "Applied"
  const appliedLabels = labels.filter(l => l.source === 'user')

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

  const handleSuggestTags = async () => {
    setIsSuggesting(true)
    try {
      const results = await suggestTags(noteId)
      // Filter out labels already applied to this note
      const filteredResults = {
        existing: results.existing.filter(name => !appliedLabels.some(l => l.name === name)),
        new: results.new.filter(name => !appliedLabels.some(l => l.name === name))
      }
      if (filteredResults.existing.length === 0 && filteredResults.new.length === 0) {
        toast.info('No new tags suggested.')
      }
      setAiSuggestions(filteredResults)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
      console.error('[LabelEditor] Suggest tags failed:', err)
    } finally {
      setIsSuggesting(false)
    }
  }

  const acceptSuggestion = (name: string) => {
    addLabel(noteId, name)
    if (aiSuggestions) {
      setAiSuggestions({
        existing: aiSuggestions.existing.filter(s => s !== name),
        new: aiSuggestions.new.filter(s => s !== name)
      })
    }
  }

  const dismissSuggestion = (name: string) => {
    if (aiSuggestions) {
      setAiSuggestions({
        existing: aiSuggestions.existing.filter(s => s !== name),
        new: aiSuggestions.new.filter(s => s !== name)
      })
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
    } else if (e.key === 'Backspace' && !input && appliedLabels.length > 0) {
      const last = appliedLabels[appliedLabels.length - 1]
      removeLabel(noteId, last.name)
    }
  }

  return (
    <div className="flex flex-col gap-3 flex-1">
      {/* Applied labels row & Input */}
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1.5 min-h-[24px] cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {appliedLabels.map(labelObj => (
            <span
              key={labelObj.name}
              className="group flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded transition-colors"
            >
              {labelObj.name}
              <button
                onClick={e => {
                  e.stopPropagation()
                  removeLabel(noteId, labelObj.name)
                }}
                className="text-red-300 hover:text-red-600 transition-colors leading-none cursor-pointer"
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
            placeholder={appliedLabels.length === 0 ? 'Add labels…' : ''}
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
                className={`px-3 py-1.5 text-xs cursor-pointer ${i === highlightedIndex ? 'bg-gray-100 text-zinc-900' : 'text-zinc-600'
                  }`}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Suggestion Controls & Transient AI labels */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleSuggestTags}
          disabled={isSuggesting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all disabled:opacity-50 text-zinc-600 shadow-sm bg-white"
        >
          <SparkleIcon />
          {isSuggesting ? 'Suggesting...' : 'Suggest Tags'}
        </button>

        {aiSuggestions && (aiSuggestions.existing.length > 0 || aiSuggestions.new.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {aiSuggestions.existing.map(name => (
              <span
                key={name}
                onClick={() => acceptSuggestion(name)}
                className="flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded cursor-pointer hover:bg-violet-200 transition-colors font-medium"
              >
                + {name}
                <button
                  onClick={(e) => { e.stopPropagation(); dismissSuggestion(name) }}
                  className="ml-0.5 text-violet-400 hover:text-violet-600 text-sm leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            {aiSuggestions.new.map(name => (
              <span
                key={name}
                onClick={() => acceptSuggestion(name)}
                className="flex items-center gap-1 text-xs border border-dashed border-violet-300 bg-violet-50/30 text-violet-600 px-2.5 py-1 rounded cursor-pointer hover:bg-violet-50 transition-colors font-medium"
              >
                + {name} <SparkleIcon />
                <button
                  onClick={(e) => { e.stopPropagation(); dismissSuggestion(name) }}
                  className="ml-0.5 text-violet-400 hover:text-violet-600 text-sm leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
