import { z } from 'zod'

// 1. FORM SCHEMA
export const subjectFormSchema = z.object({
  title: z.string().min(1, 'Subject title is required.'),
  pqf_level: z.coerce
    .number()
    .min(1, 'Level must be at least 1')
    .max(8, 'Level must be at most 8')
    .default(6),
  description: z.string().optional(),
  icon_name: z.string().default('book'),
  icon_color: z.string().default('#000000'),
  icon_bg_color: z.string().default('#ffffff'),
  is_verified: z.boolean().optional(),
})

// 2. DATABASE SCHEMA
export const subjectSchema = subjectFormSchema.extend({
  id: z.string(),
  created_at: z.coerce.date().optional(),
})

export type SubjectFormValues = z.infer<typeof subjectFormSchema>
export type Subject = z.infer<typeof subjectSchema>
