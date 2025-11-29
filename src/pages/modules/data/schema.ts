import { z } from 'zod'

export const moduleSchema = z.object({
  id: z.string(),
  subject_id: z.string(),
  title: z.string(),
  purpose: z.string().optional().nullable(),
  bloom_level: z.string().optional().nullable(),
  material_type: z.string().optional().nullable(),
  material_url: z.string().url().optional().nullable(),
  
  // [FIX] Add Verification Fields
  is_verified: z.boolean().optional(),
  verified_at: z.coerce.date().optional().nullable(),
  created_by: z.string().optional(),

  generated_summary_id: z.string().optional().nullable(),
  generated_quiz_id: z.string().optional().nullable(),
  generated_flashcards_id: z.string().optional().nullable(),
  created_at: z.coerce.date(),
  deleted: z.boolean(),
  deleted_at: z.coerce.date().nullable().optional(),
})

export type Module = z.infer<typeof moduleSchema>