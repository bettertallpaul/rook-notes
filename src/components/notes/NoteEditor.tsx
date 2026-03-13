import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { useNoteStore } from '../../store/useNoteStore'
import { useAutosave } from '../../hooks/useAutosave'
import { LabelEditor } from './LabelEditor'
import { EditorToolbar } from './EditorToolbar'

// @tiptap/markdown adds getMarkdown() to the editor instance
function getMd(editor: Editor | null): string {
  return editor ? (editor as Editor & { getMarkdown: () => string }).getMarkdown() : ''
}

// Parse markdown string → TipTap JSON via the Markdown extension's manager
function parseMd(editor: Editor, markdown: string) {
  return editor.storage.markdown.manager.parse(markdown)
}

export function NoteEditor() {
  const { notes, activeNoteId, setActiveNote, deleteNote, updateNote, updateTitle } = useNoteStore()
  const note = activeNoteId ? notes[activeNoteId] : null
  const [title, setTitle] = useState(note?.title ?? '')
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceContent, setSourceContent] = useState(note?.content ?? '')
  const titleRef = useRef<HTMLInputElement>(null)
  const sourceRef = useRef<HTMLTextAreaElement>(null)

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: '',  // populated after mount via parseMd
    editorProps: {
      attributes: {
        class: 'outline-none px-6 py-4 text-[15px] leading-[1.7] text-zinc-900 min-h-full',
      },
    },
  })

  // Load content once editor is ready (initial mount)
  useEffect(() => {
    if (!editor || !note) return
    editor.commands.setContent(parseMd(editor, note.content))
    setTimeout(() => {
      if (!note.title) titleRef.current?.focus()
      else editor.commands.focus('end')
    }, 50)
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset editor when active note changes
  useEffect(() => {
    if (!editor || !note) return
    setTitle(note.title ?? '')
    setSourceContent(note.content)
    setSourceMode(false)
    editor.commands.setContent(parseMd(editor, note.content))
    setTimeout(() => {
      if (!note.title) titleRef.current?.focus()
      else editor.commands.focus('end')
    }, 50)
  }, [activeNoteId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleSource = () => {
    if (sourceMode) {
      editor?.commands.setContent(parseMd(editor!, sourceContent))
    } else {
      setSourceContent(getMd(editor))
    }
    setSourceMode(s => !s)
  }

  const saveContent = useCallback(
    (md: string) => { if (activeNoteId) updateNote(activeNoteId, md) },
    [activeNoteId, updateNote]
  )
  const saveTitle = useCallback(
    (t: string) => { if (activeNoteId) updateTitle(activeNoteId, t) },
    [activeNoteId, updateTitle]
  )

  useAutosave(title, saveTitle)

  // Autosave on editor changes (WYSIWYG mode)
  useEffect(() => {
    if (!editor) return
    const handler = () => saveContent(getMd(editor))
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor, saveContent])

  // Autosave source content (source mode)
  useAutosave(sourceMode ? sourceContent : '', saveContent)

  const handleBack = () => {
    saveContent(sourceMode ? sourceContent : getMd(editor))
    saveTitle(title)
    setActiveNote(null)
  }

  const handleDelete = () => {
    if (activeNoteId && confirm('Delete this note?')) deleteNote(activeNoteId)
  }

  if (!note) return null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Notes
        </button>

      </div>

      {/* Title + Labels */}
      <div className="shrink-0 px-6 pt-5 pb-3 border-b border-gray-200">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (sourceMode) sourceRef.current?.focus()
              else editor?.commands.focus('end')
            }
          }}
          placeholder="Title"
          className="w-full text-xl font-semibold text-zinc-900 placeholder-zinc-300 bg-white outline-none mb-3"
        />
        <div className="flex items-center justify-between mt-2">
          <LabelEditor noteId={note.id} labels={note.labels} />
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={handleToggleSource}
              className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                sourceMode
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-400 hover:text-zinc-700 hover:bg-gray-100'
              }`}
            >
              {sourceMode ? 'Editor' : 'Source'}
            </button>
            <button
              onClick={handleDelete}
              title="Delete note"
              className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Formatting toolbar (editor mode only) */}
      {!sourceMode && editor && <EditorToolbar editor={editor} />}

      {/* Editor / Source */}
      <div className="flex-1 overflow-y-auto">
        {sourceMode ? (
          <textarea
            ref={sourceRef}
            value={sourceContent}
            onChange={e => setSourceContent(e.target.value)}
            className="w-full h-full resize-none outline-none px-6 py-4 text-[13px] leading-[1.7] text-zinc-700 font-mono bg-gray-50 caret-[#E14A34]"
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} className="h-full" />
        )}
      </div>
    </div>
  )
}
