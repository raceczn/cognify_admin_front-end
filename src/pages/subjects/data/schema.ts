import { z } from 'zod'

// Base schema for creating/updating (User input)
export const subjectBaseSchema = z.object({
  title: z.string().min(1, 'Subject title is required.'),
  pqf_level: z.coerce.number().min(1).max(8).optional().default(6),
  description: z.string().optional(),
  
  // Optional metadata
  icon_name: z.string().optional().default('book'),
  icon_color: z.string().optional().default('#000000'),
  icon_bg_color: z.string().optional().default('#ffffff'),
  
  // Verification fields (readonly for user)
  is_verified: z.boolean().optional(),
})

// Full schema for reading from Backend (includes ID)
export const subjectSchema = subjectBaseSchema.extend({
  id: z.string(), // Standardized ID
  created_at: z.coerce.date().optional(),
})

export type Subject = z.infer<typeof subjectSchema>
export type SubjectBase = z.infer<typeof subjectBaseSchema>