import { z } from 'zod'

// Base schema for creating/updating (User input)
export const subjectBaseSchema = z.object({
  subject_name: z.string().min(1, 'Subject name is required.'),
  pqf_level: z.coerce.number().nullable().optional(),
  active_tos_id: z.string().nullable().optional(),
  
  // --- NEW FIELDS ---
  description: z.string().optional(),
  icon_name: z.string().optional().default('book'),
  icon_color: z.string().optional().default('#000000'),
  icon_bg_color: z.string().optional().default('#ffffff'),
  card_bg_color: z.string().optional().default('#ffffff'),
})

// Full schema for reading from Backend (includes ID)
export const subjectSchema = subjectBaseSchema.extend({
  subject_id: z.string().min(1, 'Subject ID is required.'),
})

export type Subject = z.infer<typeof subjectSchema>
export type SubjectBase = z.infer<typeof subjectBaseSchema>