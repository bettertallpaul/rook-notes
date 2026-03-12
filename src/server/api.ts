import express from 'express'
import cors from 'cors'
import { apiReference } from '@scalar/express-api-reference'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import * as store from './store.js'
import { NoteSchema, CreateNoteSchema, UpdateNoteSchema, AddLabelSchema } from '../shared/schemas.js'

// --- OpenAPI spec ---

const registry = new OpenAPIRegistry()

registry.register('Note', NoteSchema)
registry.register('CreateNote', CreateNoteSchema)
registry.register('UpdateNote', UpdateNoteSchema)
registry.register('AddLabel', AddLabelSchema)

registry.registerPath({
  method: 'get', path: '/api/notes', summary: 'List or search notes',
  request: { query: z.object({ q: z.string().optional().openapi({ description: 'Search query' }) }) },
  responses: { 200: { description: 'List of notes', content: { 'application/json': { schema: z.array(NoteSchema) } } } },
})
registry.registerPath({
  method: 'get', path: '/api/notes/{id}', summary: 'Get a note by ID',
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Note', content: { 'application/json': { schema: NoteSchema } } },
    404: { description: 'Not found' },
  },
})
registry.registerPath({
  method: 'post', path: '/api/notes', summary: 'Create a note',
  request: { body: { content: { 'application/json': { schema: CreateNoteSchema } } } },
  responses: { 201: { description: 'Created note', content: { 'application/json': { schema: NoteSchema } } } },
})
registry.registerPath({
  method: 'patch', path: '/api/notes/{id}', summary: 'Update a note',
  request: { params: z.object({ id: z.string() }), body: { content: { 'application/json': { schema: UpdateNoteSchema } } } },
  responses: {
    200: { description: 'Updated note', content: { 'application/json': { schema: NoteSchema } } },
    404: { description: 'Not found' },
  },
})
registry.registerPath({
  method: 'delete', path: '/api/notes/{id}', summary: 'Delete a note',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
})
registry.registerPath({
  method: 'post', path: '/api/notes/{id}/labels', summary: 'Add a label to a note',
  request: { params: z.object({ id: z.string() }), body: { content: { 'application/json': { schema: AddLabelSchema } } } },
  responses: {
    200: { description: 'Updated note', content: { 'application/json': { schema: NoteSchema } } },
    404: { description: 'Not found' },
  },
})
registry.registerPath({
  method: 'delete', path: '/api/notes/{id}/labels/{label}', summary: 'Remove a label from a note',
  request: { params: z.object({ id: z.string(), label: z.string() }) },
  responses: {
    200: { description: 'Updated note', content: { 'application/json': { schema: NoteSchema } } },
    404: { description: 'Not found' },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)
const openApiSpec = generator.generateDocument({
  openapi: '3.0.0',
  info: { title: 'Rook Notes API', version: '1.0.0', description: 'HTTP API for the Rook note-taking app' },
  servers: [{ url: 'http://localhost:3001' }],
})

// --- SSE for live updates ---

import type { Response } from 'express'
import type { ServerResponse } from 'node:http'

const sseClients = new Set<ServerResponse>()

function broadcast() {
  for (const client of sseClients) {
    client.write(`data: changed\n\n`)
  }
}

// --- Express app ---

const app = express()
app.use(cors())
app.use(express.json())

// API docs
app.get('/openapi.json', (_req, res) => res.json(openApiSpec))
app.use('/docs', apiReference({ spec: { url: '/openapi.json' } }))

// SSE stream — clients subscribe to get notified of data changes
app.get('/api/events', (req, res) => {
  req.socket.setNoDelay(true)
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  res.flushHeaders()
  res.write(`data: connected\n\n`)
  const raw = res as unknown as ServerResponse
  sseClients.add(raw)
  req.on('close', () => sseClients.delete(raw))
})

// List / search notes
app.get('/api/notes', (req, res) => {
  const q = req.query.q as string | undefined
  res.json(q ? store.searchNotes(q) : store.listNotes())
})

// Get single note
app.get('/api/notes/:id', (req, res) => {
  const note = store.getNote(req.params.id)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
})

// Create note
app.post('/api/notes', (req, res) => {
  const result = CreateNoteSchema.safeParse(req.body ?? {})
  if (!result.success) return res.status(400).json({ error: result.error.flatten() })
  const { title, content, labels } = result.data
  const note = store.createNote(title, content, labels)
  res.status(201).json(note)
  broadcast()
})

// Update note
app.patch('/api/notes/:id', (req, res) => {
  const result = UpdateNoteSchema.safeParse(req.body ?? {})
  if (!result.success) return res.status(400).json({ error: result.error.flatten() })
  const note = store.updateNote(req.params.id, result.data)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
  broadcast()
})

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  if (!store.deleteNote(req.params.id)) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true })
  broadcast()
})

// Add label
app.post('/api/notes/:id/labels', (req, res) => {
  const result = AddLabelSchema.safeParse(req.body ?? {})
  if (!result.success) return res.status(400).json({ error: result.error.flatten() })
  const note = store.addLabel(req.params.id, result.data.label)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
  broadcast()
})

// Remove label
app.delete('/api/notes/:id/labels/:label', (req, res) => {
  const note = store.removeLabel(req.params.id, req.params.label)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
  broadcast()
})

const PORT = parseInt(process.env.API_PORT ?? '3001', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rook API listening on :${PORT}`)
  console.log(`API docs available at http://localhost:${PORT}/docs`)
})
