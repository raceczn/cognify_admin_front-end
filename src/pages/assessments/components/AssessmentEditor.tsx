// src/components/AssessmentEditor.tsx
import { useState, useEffect } from 'react'
import {
  Assessment,
  Question,
  QuestionType,
  AssessmentPurpose, // Import the new type
} from '@/pages/assessments/data/assessment'
import { Pencil, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
// Import types
import { QuestionEditor } from './QuestionEditor'

// Import the new QuestionEditor

// --- COMPONENT PROPS TYPES ---
interface AssessmentEditorProps {
  assessment: Assessment
  onUpdateAssessment: (assessment: Assessment) => void
}

// --- SIMULATED DATA FOR DROPDOWNS ---
// In a real application, this would come from an API
const SUBJECT_IDS = ['subj-math', 'subj-sci', 'subj-hist']
const MODULE_IDS = ['mod-calc1', 'mod-phys1', 'mod-ww2']

// FIX: New simulated data for the Purpose dropdown
const ASSESSMENT_PURPOSES: AssessmentPurpose[] = [
  'Pre-Test',
  'Quiz',
  'Post-Test',
  'Practice_Exam',
  'Diagnostic',
]

// Sentinel value to represent a cleared selection in the Select component
const CLEAR_VALUE = 'clear-selection'
// --- SIMULATED DATA FOR DROPDOWNS ---

// --- COMPONENT: AssessmentEditor (Replaces FeedbackForm) ---
export function AssessmentEditor({
  assessment: initialAssessment,
  onUpdateAssessment,
}: AssessmentEditorProps) {
  // Use a unique key on the parent in index.tsx to force re-mount and re-initialization
  const [assessment, setAssessment] = useState(initialAssessment)

  // Sync internal state when the selected assessment prop changes
  useEffect(() => {
    setAssessment(initialAssessment)
  }, [initialAssessment])

  const handleUpdateDetails = (
    field: keyof Assessment,
    // FIX: Updated value type to include the sentinel CLEAR_VALUE string AND the new AssessmentPurpose type
    value: string | 'Draft' | 'Published' | AssessmentPurpose | undefined
  ) => {
    // FIX: Coerce the sentinel string back to 'undefined' for the Assessment type.
    const finalValue = value === CLEAR_VALUE ? undefined : value

    setAssessment((prev) => ({
      ...prev,
      // FIX: Add a type assertion to satisfy the Assessment key constraint on the field value
      [field]: finalValue as any,
      last_modified: new Date().toISOString().substring(0, 10),
    }))
  }

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      type: type,
      text: `[New ${type.replace('_', ' ')}]`,
      points: 5,
      options:
        type === 'multiple_choice'
          ? [
            { id: 'op1', text: 'Option 1', is_correct: true },
            { id: 'op2', text: 'Option 2', is_correct: false },
          ]
          : [], // Handle other types if they were added (e.g., short_answer)
    }
    setAssessment((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      last_modified: new Date().toISOString().substring(0, 10),
    }))
  }

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    const newQuestions = assessment.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    )
    setAssessment((prev) => ({
      ...prev,
      questions: newQuestions,
      last_modified: new Date().toISOString().substring(0, 10),
    }))
  }

  const handleDeleteQuestion = (questionId: string) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      last_modified: new Date().toISOString().substring(0, 10),
    }))
  }

  const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0)

  // Helper function to safely get the controlled value for Select
  // If assessment.subject_id/module_id is undefined, we convert it to the CLEAR_VALUE sentinel string.
  const getSelectValue = (value: string | undefined): string =>
    value === undefined ? CLEAR_VALUE : value

  return (
    <div className='space-y-6 p-4'>
      {/* Assessment Details Card */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Pencil size={18} /> Assessment Details
            </CardTitle>
          </div>
          <CardDescription>
            Edit the core information of the assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* ... Title, Description, Status Inputs (using handleUpdateDetails) ... */}
          <div className='space-y-2'>
            <Label htmlFor='assessment-title'>Title</Label>
            <Input
              id='assessment-title'
              value={assessment.title}
              onChange={(e) => handleUpdateDetails('title', e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='assessment-description'>Description</Label>
            <Textarea
              id='assessment-description'
              value={assessment.description}
              onChange={(e) =>
                handleUpdateDetails('description', e.target.value)
              }
              rows={2}
            />
          </div>

          {/* FIX: Combined Purpose, Subject, and Module Dropdowns */}
          <div className='flex gap-4'>
            {/* Purpose Dropdown (now 1/3 width) */}
            <div className='w-1/3 space-y-2'>
              <Label htmlFor='assessment-purpose'>Purpose</Label>
              <Select
                value={assessment.purpose}
                onValueChange={(value: AssessmentPurpose) =>
                  handleUpdateDetails('purpose', value)
                }
              >
                <SelectTrigger id='assessment-purpose'>
                  <SelectValue placeholder='Select Purpose' />
                </SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject ID Dropdown (now 1/3 width) */}
            <div className='w-1/3 space-y-2'>
              <Label htmlFor='assessment-subject-id'>Subject</Label>
              <Select
                // FIX: Use helper function to convert undefined state to the sentinel string
                value={getSelectValue(assessment.subject_id)}
                onValueChange={(value) =>
                  handleUpdateDetails('subject_id', value)
                }
              >
                <SelectTrigger id='assessment-subject-id'>
                  <SelectValue placeholder='Select Subject' />
                </SelectTrigger>
                <SelectContent>
                  {/* FIX: Use the CLEAR_VALUE sentinel string instead of "" or {undefined} */}
                  <SelectItem value={CLEAR_VALUE}>
                    Select Subject
                  </SelectItem>
                  {SUBJECT_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Module ID Dropdown (now 1/3 width) */}
            <div className='w-1/3 space-y-2'>
              <Label htmlFor='assessment-module-id'>Module</Label>
              <Select
                // FIX: Use helper function to convert undefined state to the sentinel string
                value={getSelectValue(assessment.module_id)}
                onValueChange={(value) =>
                  handleUpdateDetails('module_id', value)
                }
              >
                <SelectTrigger id='assessment-module-id'>
                  <SelectValue placeholder='Select Module' />
                </SelectTrigger>
                <SelectContent>
                  {/* FIX: Use the CLEAR_VALUE sentinel string instead of "" or {undefined} */}
                  <SelectItem value={CLEAR_VALUE}>
                    Select Module
                  </SelectItem>
                  {MODULE_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </CardContent>
        <CardFooter className='text-muted-foreground flex justify-between text-sm'>
          <span>Total Questions: {assessment.questions.length}</span>
          <span>Total Points: {totalPoints}</span>
        </CardFooter>
      </Card>

      {/* Question Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ListOrdered size={18} /> Questions
          </CardTitle>
          <CardDescription>
            Add and manage the questions for this assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {assessment.questions.length === 0 && (
              <p className='text-muted-foreground text-center italic'>
                No questions in this assessment. Add one below!
              </p>
            )}
            {assessment.questions.map((question: Question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={handleUpdateQuestion}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))}
          </div>
          <div className='mt-6 flex justify-end'> 
            <Button
              onClick={() => handleAddQuestion('multiple_choice')}
              className='bg-[#EDFFF0] text-blue-900 border border-blue-900 hover:bg-gray-100'            >
              Add New Question
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          <div className='w-full pt-4'>
            <Button
              onClick={() => onUpdateAssessment(assessment)}
              className='w-full'
            >
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}