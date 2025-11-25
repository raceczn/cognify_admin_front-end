// src/pages/assessments/data/assessment.ts

export type AssessmentPurpose = 
  | 'Pre-Test'
  | 'Quiz'
  | 'Post-Test'
  | 'Practice_Exam'
  | 'Diagnostic'

export type QuestionType = 'multiple_choice'

export interface Option {
  id: string
  text: string
  is_correct: boolean
}

export interface Question {
  question_id: string // FIX: Changed from 'id' to 'question_id' to match backend
  type: QuestionType
  text: string
  options: Option[] 
  points: number
}

export interface Assessment {
  id: string
  title: string
  description: string
  instructions?: string
  subject_id?: string
  module_id?: string
  purpose: AssessmentPurpose 
  
  questions: Question[]
  created_at: string
  updated_at?: string
  last_modified?: string
}

export const mockAssessments: Assessment[] = []