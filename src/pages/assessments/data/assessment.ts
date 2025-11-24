// --- ASSESSMENT TYPES ---

/**
 * Defines the specific purpose or context of the assessment
 * in a licensure exam review system.
 */
export type AssessmentPurpose = 
  | 'Pre-Test'        // Assessment taken before a module/subject to gauge prior knowledge.
  | 'Quiz'            // Short, focused assessment, typically within a module.
  | 'Post-Test'       // Assessment taken after a module/subject to gauge learning.
  | 'Practice_Exam'   // Comprehensive, simulated licensure exam.
  | 'Diagnostic'      // Assessment to identify specific strengths/weaknesses.

export type QuestionType = 'multiple_choice'

export interface Option {
  id: string
  text: string
  is_correct: boolean
}

export interface Question {
  id: string
  type: QuestionType
  text: string
  options: Option[] // Used for multiple_choice/true_false
  points: number
}

export interface Assessment {
  id: string
  title: string
  description: string
  subject_id?: string
  module_id?: string
  /** New Field */
  purpose: AssessmentPurpose 
  
  questions: Question[]
  created_at: string
  last_modified: string
}

// --- MOCK ASSESSMENT DATA (PSYCHOLOGY-FOCUSED) ---
export const mockAssessments: Assessment[] = [
  {
    id: 'a1',
    title: 'Cognitive Psychology: Memory Fundamentals',
    description: 'An introductory test on the basic models and types of human memory.',
    subject_id: 'SUBJ_PSYCH',
    module_id: 'MOD_COG101',
    purpose: 'Post-Test', // Added purpose
    created_at: '2025-10-15',
    last_modified: '2025-11-20',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        text: 'According to the **Atkinson-Shiffrin model** (Multi-Store Model), what is the typical capacity and duration of **short-term memory**?',
        points: 1,
        options: [
          { id: 'a', text: 'Unlimited capacity; decades of duration.', is_correct: false },
          { id: 'b', text: 'Large capacity; fraction of a second duration.', is_correct: false },
          { id: 'c', text: 'Limited capacity (approx. 7 $\\pm$ 2 items); 15-30 seconds duration.', is_correct: true },
          { id: 'd', text: 'Limited capacity; unlimited duration.', is_correct: false },
        ],
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        text: 'Which memory type stores general knowledge, facts, and concepts (e.g., knowing the capital of France)?',
        points: 1,
        options: [
          { id: 'a', text: 'Episodic Memory', is_correct: false },
          { id: 'b', text: 'Procedural Memory', is_correct: false },
          { id: 'c', text: 'Semantic Memory', is_correct: true },
          { id: 'd', text: 'Implicit Memory', is_correct: false },
        ],
      },
    ],
  },
  {
    id: 'a2',
    title: 'Theories of Personality',
    description: 'Assessment on Freudian psychoanalysis and basic trait theories.',
    subject_id: 'SUBJ_PSYCH',
    module_id: 'MOD_PERS202',
    purpose: 'Quiz', // Added purpose
    created_at: '2025-11-01',
    last_modified: '2025-11-24',
    questions: [
      {
        id: 'q3',
        type: 'multiple_choice',
        text: 'In Freudian theory, the personality structure that operates on the **pleasure principle** and seeks immediate gratification is the:',
        points: 1,
        options: [
          { id: 'a', text: 'Ego', is_correct: false },
          { id: 'b', text: 'Superego', is_correct: false },
          { id: 'c', text: 'Id', is_correct: true },
        ],
      },
    ],
  },

  // --- NEW ASSESSMENTS START HERE (Purpose fields added) ---

  {
    id: 'a3',
    title: 'Psychological Assessment: Reliability & Validity',
    description: 'Covers fundamental psychometric properties required for sound psychological measurement.',
    subject_id: 'SUBJ_PSYC_ASSESS',
    module_id: 'MOD_PSYCHOMETRICS101',
    purpose: 'Diagnostic',
    created_at: '2025-11-24',
    last_modified: '2025-11-24',
    questions: [
      {
        id: 'q4',
        type: 'multiple_choice',
        text: 'A test that consistently yields the same results upon retesting a person is considered **reliable**. Which type of validity is conceptually required for a test to be considered truly useful and accurate?',
        points: 1,
        options: [
          { id: 'a', text: 'Inter-rater Reliability', is_correct: false },
          { id: 'b', text: 'Content Validity', is_correct: false },
          { id: 'c', text: 'Construct Validity', is_correct: true },
          { id: 'd', text: 'Test-retest Reliability', is_correct: false },
        ],
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        text: 'If a researcher is comparing scores on a newly developed measure of anxiety to an existing, well-established measure of anxiety (administered concurrently), they are primarily examining:',
        points: 1,
        options: [
          { id: 'a', text: 'Predictive Validity', is_correct: false },
          { id: 'b', text: 'Convergent Validity', is_correct: true },
          { id: 'c', text: 'Discriminant Validity', is_correct: false },
          { id: 'd', text: 'Face Validity', is_correct: false },
        ],
      },
    ],
  },

  {
    id: 'a4',
    title: 'I/O Psychology: Motivation Theories',
    description: 'Focuses on classic need-based and process theories in the workplace.',
    subject_id: 'SUBJ_IO_PSYCH',
    module_id: 'MOD_MOTIVATION302',
    purpose: 'Pre-Test',
    created_at: '2025-11-24',
    last_modified: '2025-11-24',
    questions: [
      {
        id: 'q6',
        type: 'multiple_choice',
        text: 'According to **Herzberg\'s Two-Factor Theory**, which of the following is considered a **Motivator** (or satisfier) that *increases* job satisfaction, rather than just preventing dissatisfaction?',
        points: 1,
        options: [
          { id: 'a', text: 'Adequate Salary and Benefits', is_correct: false },
          { id: 'b', text: 'Fair Company Policies', is_correct: false },
          { id: 'c', text: 'Working Conditions', is_correct: false },
          { id: 'd', text: 'Achievement and Recognition', is_correct: true },
        ],
      },
      {
        id: 'q7',
        type: 'multiple_choice',
        text: 'In **Maslow\'s Hierarchy of Needs**, the need for **Love and Belonging** (friendship, family, intimacy) is typically preceded by the satisfaction of which level of needs?',
        points: 1,
        options: [
          { id: 'a', text: 'Physiological and Safety Needs', is_correct: true },
          { id: 'b', text: 'Esteem Needs', is_correct: false },
          { id: 'c', text: 'Self-Actualization Needs', is_correct: false },
          { id: 'd', text: 'Growth Needs (ERG Theory)', is_correct: false },
        ],
      },
    ],
  },

  {
    id: 'a5',
    title: 'Developmental Psychology: Cognitive Milestones',
    description: 'Examines key concepts from Jean Piaget\'s stages of cognitive development.',
    subject_id: 'SUBJ_DEV_PSYCH',
    module_id: 'MOD_COG_DEV205',
    purpose: 'Quiz',
    created_at: '2025-11-24',
    last_modified: '2025-11-24',
    questions: [
      {
        id: 'q8',
        type: 'multiple_choice',
        text: 'A child believes that a tall, thin glass holds more liquid than a short, wide glass, even though they watched the same amount of water poured into both. This difficulty is characteristic of the **Preoperational Stage** (ages 2-7) and demonstrates a lack of understanding of:',
        points: 1,
        options: [
          { id: 'a', text: 'Egocentrism', is_correct: false },
          { id: 'b', text: 'Object Permanence', is_correct: false },
          { id: 'c', text: 'Conservation', is_correct: true },
          { id: 'd', text: 'Abstract Reasoning', is_correct: false },
        ],
      },
      {
        id: 'q9',
        type: 'multiple_choice',
        text: 'In which of Piaget\'s stages do children typically develop **Object Permanence** (understanding that things exist even when out of sight)?',
        points: 1,
        options: [
          { id: 'a', text: 'Sensorimotor Stage (Birth to 2 years)', is_correct: true },
          { id: 'b', text: 'Preoperational Stage (2 to 7 years)', is_correct: false },
          { id: 'c', text: 'Concrete Operational Stage (7 to 11 years)', is_correct: false },
          { id: 'd', text: 'Formal Operational Stage (12 years and up)', is_correct: false },
        ],
      },
    ],
  },

  {
    id: 'a6',
    title: 'Abnormal Psychology: Anxiety Disorders',
    description: 'A brief assessment on the diagnostic criteria and features of Generalized Anxiety Disorder (GAD).',
    subject_id: 'SUBJ_ABNORMAL_PSYCH',
    module_id: 'MOD_ANXIETY301',
    purpose: 'Practice_Exam',
    created_at: '2025-11-24',
    last_modified: '2025-11-24',
    questions: [
      {
        id: 'q10',
        type: 'multiple_choice',
        text: 'According to the **DSM-5 criteria** for **Generalized Anxiety Disorder (GAD)**, the excessive anxiety and worry must occur more days than not for a period of at least:',
        points: 1,
        options: [
          { id: 'a', text: 'One month', is_correct: false },
          { id: 'b', text: 'Three months', is_correct: false },
          { id: 'c', text: 'Six months', is_correct: true },
          { id: 'd', text: 'Twelve months', is_correct: false },
        ],
      },
      {
        id: 'q11',
        type: 'multiple_choice',
        text: 'A key feature that distinguishes Generalized Anxiety Disorder (GAD) from a Panic Disorder is that in GAD, the worry is typically:',
        points: 1,
        options: [
          { id: 'a', text: 'Confined to social performance situations.', is_correct: false },
          { id: 'b', text: 'Focused on experiencing recurrent, unexpected physical attacks.', is_correct: false },
          { id: 'c', text: 'Excessive about a wide variety of everyday events or activities.', is_correct: true },
          { id: 'd', text: 'Limited to specific, non-harmful objects or situations.', is_correct: false },
        ],
      },
    ],
  },

  // --- NEW ASSESSMENTS END HERE ---
];