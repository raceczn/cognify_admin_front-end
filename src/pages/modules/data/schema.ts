import { z } from 'zod'

// 1. FORM SCHEMA (No ID)
export const moduleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject_id: z.string().min(1, 'Subject is required'),
  purpose: z.string().optional(),
  
  // Bloom Levels (Array)
  bloom_levels: z.array(z.string()).default([]),
  
  // This will now store the uploaded PDF URL
  material_url: z.string().optional().or(z.literal('')),
  
  // [FIX] Updated enum to 'pdf' instead of 'url'
  content: z.string().optional(), 
  input_type: z.enum(['pdf', 'text']).default('pdf'), 

  is_verified: z.boolean().optional(),
})

// 2. DATABASE SCHEMA (Has ID)
export const moduleSchema = moduleFormSchema.extend({
  id: z.string(),
  bloom_level: z.string().optional(), 
  verified_at: z.coerce.date().optional().nullable(),
  created_by: z.string().optional(),
  created_at: z.coerce.date().optional(),
  deleted: z.boolean().optional(),
})

export type ModuleFormValues = z.infer<typeof moduleFormSchema>
export type Module = z.infer<typeof moduleSchema>