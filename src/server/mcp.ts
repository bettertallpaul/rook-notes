import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import { z } from 'zod'
import type { Note } from '../shared/schemas.js'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001'

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
}

function ok(note: Note) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(note, null, 2) }] }
}

function err(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true }
}

function createRookMcpServer() {
  const server = new McpServer({ name: 'rook-notes', version: '0.1.0' })

  server.tool(
    'search_notes',
    'Search notes by keyword, or list all notes if no query is given',
    { query: z.string().optional().describe('Search keyword') },
    async ({ query }) => {
      const path = query ? `/api/notes?q=${encodeURIComponent(query)}` : '/api/notes'
      const notes = await apiGet<Note[]>(path)
      return { content: [{ type: 'text', text: JSON.stringify(notes, null, 2) }] }
    },
  )

  server.tool(
    'create_note',
    'Create a new note with title, content, and optional labels',
    {
      title: z.string().describe('Note title'),
      content: z.string().optional().describe('Note content (markdown)'),
      labels: z.array(z.string()).optional().describe('Labels to apply'),
    },
    async ({ title, content, labels }) => {
      const note = await apiPost<Note>('/api/notes', { title, content: content ?? '', labels: labels ?? [] })
      return ok(note)
    },
  )

  server.tool(
    'edit_note',
    'Edit a note — update title, content, and/or reconcile labels to a desired final set',
    {
      id: z.string().describe('Note ID'),
      title: z.string().optional().describe('New title'),
      content: z.string().optional().describe('New content (markdown)'),
      labels: z.array(z.string()).optional().describe('Desired final set of labels (replaces current labels)'),
    },
    async ({ id, title, content, labels }) => {
      // Fetch current state
      let note: Note
      try {
        note = await apiGet<Note>(`/api/notes/${id}`)
      } catch {
        return err('Note not found')
      }

      // Update title/content if provided
      if (title !== undefined || content !== undefined) {
        note = await apiPatch<Note>(`/api/notes/${id}`, { title, content })
      }

      // Reconcile labels if provided
      if (labels !== undefined) {
        const current = new Set(note.labels)
        const desired = new Set(labels)
        const toAdd = labels.filter(l => !current.has(l))
        const toRemove = note.labels.filter(l => !desired.has(l))
        for (const label of toAdd) {
          note = await apiPost<Note>(`/api/notes/${id}/labels`, { label })
        }
        for (const label of toRemove) {
          await apiDelete(`/api/notes/${id}/labels/${encodeURIComponent(label)}`)
        }
        // Fetch final state after label changes
        if (toAdd.length > 0 || toRemove.length > 0) {
          note = await apiGet<Note>(`/api/notes/${id}`)
        }
      }

      return ok(note)
    },
  )

  server.tool(
    'delete_note',
    'Delete a note by ID',
    { id: z.string().describe('Note ID') },
    async ({ id }) => {
      try {
        await apiDelete(`/api/notes/${id}`)
        return { content: [{ type: 'text', text: 'Note deleted.' }] }
      } catch {
        return err('Note not found')
      }
    },
  )

  return server
}

const app = express()
app.use(express.json())

app.post('/mcp', async (req, res) => {
  const server = createRookMcpServer()
  try {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
    res.on('close', () => {
      transport.close()
      server.close()
    })
  } catch (error) {
    console.error('MCP error:', error)
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null })
    }
  }
})

app.get('/mcp', (_req, res) => {
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null })
})

app.delete('/mcp', (_req, res) => {
  res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null })
})

const PORT = parseInt(process.env.MCP_PORT ?? '3002', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rook MCP server listening on :${PORT}/mcp`)
})
