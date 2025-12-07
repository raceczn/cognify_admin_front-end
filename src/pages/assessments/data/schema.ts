import { z } from 'zod'

// [FIX] Values matched to backend database/enums.py
export const ASSESSMENT_PURPOSES = [
    'pre-assessment',
    'quiz',
    'post-assessment',
    'diagnostic',
] as const

export const QUESTION_TYPES = [
    'multiple_choice',
    'multiple_responses',
    'true_false',
    'short_answer',
    'fill_in_the_blank',
    'matching',
    'sequence',
    'rationale'
] as const

export const optionSchema = z.object({
    id: z.string(),
    text: z.string(),
    is_correct: z.boolean().optional(),
})

export const questionSchema = z.object({
    question_id: z.string().optional(),
    text: z.string().min(1, "Question text required"),
    type: z.enum(QUESTION_TYPES),
    points: z.number().min(1).default(1),
    options: z.array(optionSchema).optional(), 
    competency_id: z.string().optional(),
    bloom_taxonomy: z.string().optional(),
    difficulty_level: z.string().optional(),
    answer: z.string().optional(), 
})

export const assessmentFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    purpose: z.enum(ASSESSMENT_PURPOSES),
    subject_id: z.string().min(1, 'Subject is required'),
    module_id: z.string().optional().nullable(),
    bloom_levels: z.array(z.string()).optional().default([]),
    questions: z.array(questionSchema).optional().default([]),
    is_verified: z.boolean().optional(),
    type: z.string().optional()
})

export const assessmentSchema = assessmentFormSchema.extend({
    id: z.string(),
    total_items: z.number().optional(),
    is_rejected: z.boolean().optional(),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
})

export type AssessmentFormValues = z.infer<typeof assessmentFormSchema>
export type Assessment = z.infer<typeof assessmentSchema>
export type Question = z.infer<typeof questionSchema>
export type Option = z.infer<typeof optionSchema>
export type QuestionType = typeof QUESTION_TYPES[number]
export type AssessmentPurpose = typeof ASSESSMENT_PURPOSES[number]