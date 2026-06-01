import type { Note } from '../types/note'

export function getTitle(content: string): string {
  const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim()
  return firstLine || 'Untitled'
}

export function getSnippet(content: string, maxLength = 140, skipFirst = true): string {
  const lines = content.split('\n').filter(l => l.trim())
  const body = lines.slice(skipFirst ? 1 : 0).join(' ').replace(/[#*`_[\]]/g, '').trim()
  if (!body) return ''
  return body.length > maxLength ? body.slice(0, maxLength) + '…' : body
}

export function isStale(note: Note): boolean {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  return note.updatedAt < thirtyDaysAgo && note.editCount < 3
}

export function isRecent(note: Note): boolean {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return note.updatedAt > sevenDaysAgo
}

export function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
