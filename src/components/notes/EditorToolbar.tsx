import type { Editor } from '@tiptap/react'
import clsx from 'clsx'

interface Props {
  editor: Editor
}

type ToolbarItem =
  | { type: 'button'; label: string; title: string; action: () => void; active: () => boolean }
  | { type: 'separator' }

export function EditorToolbar({ editor }: Props) {
  const items: ToolbarItem[] = [
    {
      type: 'button',
      label: 'B',
      title: 'Bold (⌘B)',
      action: () => editor.chain().focus().toggleBold().run(),
      active: () => editor.isActive('bold'),
    },
    {
      type: 'button',
      label: 'I',
      title: 'Italic (⌘I)',
      action: () => editor.chain().focus().toggleItalic().run(),
      active: () => editor.isActive('italic'),
    },
    {
      type: 'button',
      label: 'S',
      title: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      active: () => editor.isActive('strike'),
    },
    {
      type: 'button',
      label: '</>',
      title: 'Inline code',
      action: () => editor.chain().focus().toggleCode().run(),
      active: () => editor.isActive('code'),
    },
    { type: 'separator' },
    {
      type: 'button',
      label: 'H1',
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: () => editor.isActive('heading', { level: 1 }),
    },
    {
      type: 'button',
      label: 'H2',
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: () => editor.isActive('heading', { level: 2 }),
    },
    {
      type: 'button',
      label: 'H3',
      title: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: () => editor.isActive('heading', { level: 3 }),
    },
    { type: 'separator' },
    {
      type: 'button',
      label: '• List',
      title: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: () => editor.isActive('bulletList'),
    },
    {
      type: 'button',
      label: '1. List',
      title: 'Ordered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: () => editor.isActive('orderedList'),
    },
    { type: 'separator' },
    {
      type: 'button',
      label: '❝',
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: () => editor.isActive('blockquote'),
    },
    {
      type: 'button',
      label: '```',
      title: 'Code block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: () => editor.isActive('codeBlock'),
    },
  ]

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-gray-200 bg-gray-50 shrink-0 flex-wrap">
      {items.map((item, i) => {
        if (item.type === 'separator') {
          return <div key={i} className="w-px h-4 bg-gray-200 mx-1" />
        }
        return (
          <button
            key={item.label}
            onMouseDown={e => {
              e.preventDefault() // prevent editor losing focus
              item.action()
            }}
            title={item.title}
            className={clsx(
              'px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer select-none',
              item.active()
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-gray-200'
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
