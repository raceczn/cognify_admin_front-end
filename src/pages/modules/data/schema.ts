import { z } from 'zod'

// 1. FORM SCHEMA (No ID)
export const moduleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject_id: z.string().min(1, 'Subject is required'),
  purpose: z.string().optional(),
  // [FIX] Changed from bloom_level: z.string() to bloom_levels: z.array(z.string())
  bloom_levels: z.array(z.string()).default([]),
  material_url: z.string().optional().or(z.literal('')),
  is_verified: z.boolean().optional(),
})

// 2. DATABASE SCHEMA (Has ID)
export const moduleSchema = moduleFormSchema.extend({
  id: z.string(),
  // Keeping bloom_level for potential backend compatibility (will use first element)
  bloom_level: z.string().optional(), 
  verified_at: z.coerce.date().optional().nullable(),
  created_by: z.string().optional(),
  created_at: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
})

export type ModuleFormValues = z.infer<typeof moduleFormSchema>
export type Module = z.infer<typeof moduleSchema>