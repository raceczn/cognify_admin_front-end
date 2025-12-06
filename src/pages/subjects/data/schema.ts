import { z } from 'zod'

// 1. NESTED SCHEMAS (Matches the "topics" and "competencies" structure)

// Schema for individual competencies inside a topic
export const competencySchema = z.object({
  id: z.string().optional(), // Optional because new items won't have an ID yet
  code: z.string().min(1, 'Code is required'), // e.g., "C-771"
  description: z.string().min(1, 'Description is required'),
  allocated_items: z.coerce.number().min(0).default(0),
  target_difficulty: z.string().default('Easy'), // e.g., "Moderate"
  target_bloom_level: z.string().default('remembering'), // e.g., "understanding"
})

// Schema for topics inside the subject
export const topicSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Topic title is required'),
  image: z.string().nullable().optional(), // Handles "image": null
  weight_percentage: z.coerce.number().min(0).max(100).default(0),
  lecture_content: z.string().optional().nullable(),
  competencies: z.array(competencySchema).default([]),
})

// 2. FORM SCHEMA (Main Entry Point)
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
  image_url: z.string().url().optional().nullable(),
  
  // [FIX] Added topics array here to match the JSON structure
  topics: z.array(topicSchema).default([]),
})

// 3. DATABASE SCHEMA (Extends Form Schema with DB-generated fields)
export const subjectSchema = subjectFormSchema.extend({
  id: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional().nullable(), // Added based on sample data
  total_weight_percentage: z.number().default(0),
  is_active: z.boolean().default(true) // Added based on sample data
})

// 4. TYPE DEFINITIONS
export type SubjectFormValues = z.infer<typeof subjectFormSchema>
export type Subject = z.infer<typeof subjectSchema>
export type Topic = z.infer<typeof topicSchema>
export type Competency = z.infer<typeof competencySchema>