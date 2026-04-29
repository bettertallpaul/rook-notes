import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const LabelSchema = z.object({
  name: z.string().openapi({ example: 'work' }),
  source: z.enum(['user']).openapi({ example: 'user' }),
}).openapi('Label')

export const NoteSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  title: z.string().openapi({ example: 'My Note' }),
  content: z.string().openapi({ example: '# Hello\n\nSome content here.' }),
  labels: z.array(LabelSchema).openapi({ example: [{ name: 'work', source: 'user' }] }),
  createdAt: z.number().openapi({ example: 1704067200000 }),
  updatedAt: z.number().openapi({ example: 1704067200000 }),
  openedAt: z.number().openapi({ example: 1704067200000 }),
  editCount: z.number().openapi({ example: 3 }),
}).openapi('Note')

export const CreateNoteSchema = z.object({
  title: z.string().default('').openapi({ example: 'My Note' }),
  content: z.string().default('').openapi({ example: '# Hello' }),
  labels: z.array(LabelSchema).default([]).openapi({ example: [{ name: 'work', source: 'user' }] }),
}).openapi('CreateNote')

export const UpdateNoteSchema = z.object({
  title: z.string().optional().openapi({ example: 'Updated Title' }),
  content: z.string().optional().openapi({ example: '# Updated content' }),
}).openapi('UpdateNote')

export const AddLabelSchema = z.object({
  name: z.string().openapi({ example: 'work' }),
  source: z.enum(['user']).default('user').openapi({ example: 'user' }),
}).openapi('AddLabel')

export type Label = z.infer<typeof LabelSchema>
export type Note = z.infer<typeof NoteSchema>
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>

// Server-only configuration schema
export const ServerConfigSchema = z.object({
  TAXONOMY_MODEL: z.string().default('gemini-2.5-flash-lite'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  AI_ENABLED: z.string()
    .default('true')
    .transform((v) => v.trim() === 'true'),
})

export type ServerConfig = z.infer<typeof ServerConfigSchema>

// Pragmatic config export: Validate once on boot, only in Node environments
export const config = typeof process !== 'undefined' && process.env 
  ? ServerConfigSchema.parse(process.env)
  : {} as ServerConfig
