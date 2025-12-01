// src/types/index.ts

// --- ENUMS (Matching database/enums.py) ---

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  FACULTY = 'faculty_member',
}

export enum AssessmentType {
  PRE_ASSESSMENT = 'pre-assessment',
  QUIZ = 'quiz',
  POST_ASSESSMENT = 'post-assessment',
  DIAGNOSTIC = 'diagnostic',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_RESPONSES = 'multiple_responses',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  FILL_IN_THE_BLANK = 'fill_in_the_blank',
  MATCHING = 'matching',
  SEQUENCE = 'sequence',
  RATIONALE = 'rationale',
}

export enum BloomTaxonomy {
  REMEMBERING = 'remembering',
  UNDERSTANDING = 'understanding',
  APPLYING = 'applying',
  ANALYZING = 'analyzing',
  EVALUATING = 'evaluating',
  CREATING = 'creating',
}

export enum DifficultyLevel {
  EASY = 'Easy',
  MODERATE = 'Moderate',
  DIFFICULT = 'Difficult',
}

export enum ProgressStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

// --- INTERFACES (Matching database/models.py) ---

// Matches PreRegisteredUserSchema
export interface PreRegisteredUser {
  id: string; // Firestore ID
  email: string;
  assigned_role: UserRole; // Fixed: Backend uses 'assigned_role', not 'role'
  is_registered: boolean;
  added_by: string;
  created_at: string;
}

// Matches QuestionSchema
export interface Question {
  id?: string;
  text: string;
  type: QuestionType;
  choices?: string[]; // Optional: Backend defaults to []
  correct_answers?: string | boolean | string[]; // Polymorphic in backend
  competency_id?: string;
  bloom_taxonomy?: BloomTaxonomy;
  difficulty_level?: DifficultyLevel;
  points?: number;
  rationale?: string;
  references?: string[];
  tags?: string[];
}

// Matches AssessmentSchema
export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  subject_id: string;
  module_id?: string;
  description?: string;
  bloom_levels?: string[];
  questions: Question[];
  total_items: number;
  is_verified: boolean; // Fixed: Backend uses 'is_verified', not 'status'
  created_at: string;
}

// Matches implicit Module schema (from routes/modules.py)
export interface Module {
  id: string;
  title: string;
  subject_id: string;
  purpose?: string;
  bloom_levels?: string[];
  content?: string;
  material_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

// Matches SubjectSchema
export interface Subject {
  id: string;
  title: string;
  pqf_level: number;
  description?: string;
  total_weight_percentage: number;
  content?: string;
  material_url?: string;
  image_url?: string;
  icon_name?: string;
  icon_color?: string;
  icon_bg_color?: string;
  created_by?: string;
  is_active: boolean;
  is_verified: boolean;
  deleted: boolean;
}