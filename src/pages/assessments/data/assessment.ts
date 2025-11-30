// src/pages/assessments/data/assessment.ts
import { z } from 'zod'

// --- 1. Assessment Purpose Type ---
export const ASSESSMENT_PURPOSES = [
    'Pre-Test',
    'Quiz',
    'Post-Test',
    'Practice_Exam',
    'Diagnostic',
] as const;

export type AssessmentPurpose = typeof ASSESSMENT_PURPOSES[number];

// --- 2. Question Types ---
export const QUESTION_TYPES = [
    'multiple_choice',
    'multiple_response',
    'true_false',
    'essay',
] as const;

export type QuestionType = typeof QUESTION_TYPES[number];

// --- 3. Option/Answer Schema ---
export const optionSchema = z.object({
    id: z.string(),
    text: z.string(),
    is_correct: z.boolean().optional(),
})
export type Option = z.infer<typeof optionSchema>;

// --- 4. Question Schema ---
export const questionSchema = z.object({
    question_id: z.string(),
    text: z.string(),
    type: z.enum(QUESTION_TYPES),
    points: z.number().min(1).default(1),
    options: z.array(optionSchema), 
    answer: z.string().optional(), 
    topic_title: z.string().optional(),
    bloom_level: z.string().optional(),
});
export type Question = z.infer<typeof questionSchema>;

// --- 5. Assessment Schema (Main) ---
export const assessmentSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    purpose: z.enum(ASSESSMENT_PURPOSES), 
    subject_id: z.string(),
    module_id: z.string().optional().nullable(),
    total_items: z.number().optional(),
    questions: z.array(questionSchema).optional(),
    
    // [FIX] Added bloom_levels for multi-selection
    bloom_levels: z.array(z.string()).optional().default([]), 
    
    is_verified: z.boolean().default(false),
    created_at: z.coerce.date().optional(),
});

export type Assessment = z.infer<typeof assessmentSchema>;