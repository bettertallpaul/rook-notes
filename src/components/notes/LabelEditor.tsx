import { useState, useRef, type KeyboardEvent } from 'react'
import { useNoteStore } from '../../store/useNoteStore'

interface LabelEditorProps {
  noteId: string
  labels: string[]
}

export function LabelEditor({ noteId, labels }: LabelEditorProps) {
  const { addLabel, removeLabel } = useNoteStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commitLabel = () => {
    const label = input.trim().replace(/,+$/, '')
    if (label) {
      addLabel(noteId, label)
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitLabel()
    } else if (e.key === 'Backspace' && !input && labels.length > 0) {
      removeLabel(noteId, labels[labels.length - 1])
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 min-h-[24px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {labels.map(label => (
        <span
          key={label}
          className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded"
        >
          {label}
          <button
            onClick={e => {
              e.stopPropagation()
              removeLabel(noteId, label)
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
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitLabel}
        placeholder={labels.length === 0 ? 'Add labels…' : ''}
        className="flex-1 min-w-[120px] bg-transparent text-xs text-zinc-500 placeholder-zinc-400 outline-none"
      />
    </div>
  )
}
