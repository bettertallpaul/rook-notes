import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const NoteSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  title: z.string().openapi({ example: 'My Note' }),
  content: z.string().openapi({ example: '# Hello\n\nSome content here.' }),
  labels: z.array(z.string()).openapi({ example: ['work', 'ideas'] }),
  createdAt: z.number().openapi({ example: 1704067200000 }),
  updatedAt: z.number().openapi({ example: 1704067200000 }),
  openedAt: z.number().openapi({ example: 1704067200000 }),
  editCount: z.number().openapi({ example: 3 }),
}).openapi('Note')

export const CreateNoteSchema = z.object({
  title: z.string().default('').openapi({ example: 'My Note' }),
  content: z.string().default('').openapi({ example: '# Hello' }),
  labels: z.array(z.string()).default([]).openapi({ example: ['work'] }),
}).openapi('CreateNote')

export const UpdateNoteSchema = z.object({
  title: z.string().optional().openapi({ example: 'Updated Title' }),
  content: z.string().optional().openapi({ example: '# Updated content' }),
}).openapi('UpdateNote')

export const AddLabelSchema = z.object({
  label: z.string().openapi({ example: 'work' }),
}).openapi('AddLabel')

export type Note = z.infer<typeof NoteSchema>
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>
