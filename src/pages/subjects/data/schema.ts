// src/pages/subjects/data/schema.ts
import { z } from 'zod'

// This schema is based on database/models.py SubjectBase
export const subjectBaseSchema = z.object({
  subject_name: z.string().min(1, 'Subject name is required.'),
  pqf_level: z.coerce.number().optional().nullable(),
  active_tos_id: z.string().optional().nullable(),
})

// This schema is based on database/models.py Subject
export const subjectSchema = subjectBaseSchema.extend({
  subject_id: z.string().min(1, 'Subject ID is required.'),
})

export type Subject = z.infer<typeof subjectSchema>
export type SubjectBase = z.infer<typeof subjectBaseSchema>