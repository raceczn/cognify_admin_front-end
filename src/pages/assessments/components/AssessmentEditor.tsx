import { useState, useEffect } from 'react'
import {
  Assessment,
  Question,
  QuestionType,
  AssessmentPurpose,
  Option,
} from '@/pages/assessments/data/schema'
import { Pencil, ListOrdered, Loader2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// [FIX] Import Checkbox
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { QuestionEditor } from './QuestionEditor'

interface AssessmentEditorProps {
  assessment: Assessment | null | undefined
  onUpdateAssessment: (assessment: Assessment) => void
  onBack?: () => void
  subjects?: { id: string; title: string }[]
  isVerificationMode?: boolean
  onApprove?: (assessment: Assessment) => void
  onReject?: () => void
}

const SUBJECT_IDS = [
  'SUBJ_PSYCH',
  'SUBJ_DEV_PSYCH',
  'SUBJ_ABNORMAL_PSYCH',
  'SUBJ_IO_PSYCH',
  'SUBJ_PSYC_ASSESS',
]
const MODULE_IDS = ['MOD_COG101', 'MOD_PERS202', 'MOD_MOTIVATION302']

const ASSESSMENT_PURPOSES: AssessmentPurpose[] = [
  'pre-assessment',
  'quiz',
  'post-assessment',
  'diagnostic',
]

const BLOOM_LEVELS = [
  'Remembering',
  'Understanding',
  'Applying',
  'Analyzing',
  'Evaluating',
  'Creating',
]

const CLEAR_VALUE = 'clear-selection'

const getPurposeDotColor = (purpose: AssessmentPurpose): string => {
  switch (purpose) {
    case 'diagnostic':
      return 'bg-[#D34E4E]'
    case 'post-assessment':
      return 'bg-[#8CA9FF]'
    case 'pre-assessment':
      return 'bg-[#FFA239]'
    case 'quiz':
      return 'bg-gray-400'
    default:
      return 'bg-gray-500'
  }
}

export function AssessmentEditor({
  assessment: initialAssessment,
  onUpdateAssessment,
  onBack,
  subjects = [],
  isVerificationMode,
  onApprove,
  onReject,
}: AssessmentEditorProps) {
  const [assessment, setAssessment] = useState<Assessment | null | undefined>(
    initialAssessment
  )

  useEffect(() => {
    if (initialAssessment) {
      const normalizedQuestions = (initialAssessment.questions || []).map(
        (q: any) => {
          let normalizedOptions: Option[] = []
          if (Array.isArray(q.options) && q.options.length > 0) {
            if (typeof q.options[0] === 'string') {
              normalizedOptions = q.options.map(
                (optText: string, idx: number) => ({
                  id: `opt-${q.question_id}-${idx}`,
                  text: optText,
                  is_correct: optText === q.answer,
                })
              )
            } else {
              normalizedOptions = q.options
            }
          }
          return {
            ...q,
            question_id:
              q.question_id ||
              q.id ||
              Math.random().toString(36).substring(2, 9),
            text: q.text || q.question || '',
            type: q.type || 'multiple_choice',
            points: q.points || 1,
            options: normalizedOptions,
          }
        }
      )
      setAssessment({
        ...initialAssessment,
        // [FIX] Ensure bloom_levels exists
        bloom_levels: initialAssessment.bloom_levels || [],
        questions: normalizedQuestions,
      })
    } else {
      setAssessment(initialAssessment)
    }
  }, [initialAssessment])

  const handleSave = () => {
    if (!assessment) return
    const payloadQuestions = (assessment.questions || []).map((q: Question) => {
      const correctOpt = (q.options || []).find(
        (opt: Option) => !!opt.is_correct
      )
      return {
        ...q,
        question: q.text,
        options: (q.options || []).map((opt: Option) => opt.text),
        answer: correctOpt ? correctOpt.text : '',
        topic_title: (q as any).topic_title,
        bloom_level: (q as any).bloom_level,
      }
    })
    const payload = {
      ...assessment,
      questions: payloadQuestions,
      updated_at: new Date().toISOString(),
    }
    onUpdateAssessment(payload as any)
    if (isVerificationMode && onApprove) {
      onApprove(payload as any)
    }
  }

  // [FIX] Handler for Bloom Checkboxes
  const handleBloomChange = (level: string, checked: boolean) => {
    setAssessment((prev: Assessment | null | undefined) => {
      if (!prev) return prev
      const currentLevels = prev.bloom_levels || []
      const newLevels = checked
        ? [...currentLevels, level]
        : currentLevels.filter((l: string) => l !== level)
      return { ...prev, bloom_levels: newLevels }
    })
  }

  if (!assessment) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center'>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        <span>Loading assessment...</span>
      </div>
    )
  }

  const handleUpdateDetails = (field: keyof Assessment, value: any) => {
    const finalValue = value === CLEAR_VALUE ? undefined : value
    setAssessment((prev: Assessment | null | undefined) =>
      prev ? { ...prev, [field]: finalValue } : prev
    )
  }
  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      question_id: Math.random().toString(36).substring(2, 9),
      type: type,
      text: `[New ${type.replace('_', ' ')}]`,
      points: 1,
      options: [
        { id: 'op1', text: 'Option 1', is_correct: true },
        { id: 'op2', text: 'Option 2', is_correct: false },
      ],
    }
    setAssessment((prev) =>
      prev
        ? { ...prev, questions: [...(prev.questions || []), newQuestion] }
        : prev
    )
  }
  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setAssessment((prev: Assessment | null | undefined) => {
      if (!prev) return prev
      const newQuestions = (prev.questions || []).map((q: Question) =>
        q.question_id === updatedQuestion.question_id ? updatedQuestion : q
      )
      return { ...prev, questions: newQuestions }
    })
  }
  const handleDeleteQuestion = (qId?: string) => {
    setAssessment((prev: Assessment | null | undefined) => {
      if (!prev) return prev
      return {
        ...prev,
        questions: (prev.questions || []).filter(
          (q: Question) => q.question_id !== qId
        ),
      }
    })
  }

  const questions: Question[] = assessment.questions || []
  const totalPoints = questions.reduce(
    (sum: number, q: Question) => sum + (q.points || 0),
    0
  )
  const getSelectValue = (value: string | null | undefined): string =>
    value == null ? CLEAR_VALUE : value

  return (
    <div className='space-y-6 p-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              {onBack && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={onBack}
                  className='mr-1 -ml-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              )}
              <Pencil size={18} /> Assessment Details
            </CardTitle>
          </div>
          <CardDescription>Edit the core information.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={assessment.title || ''}
              onChange={(e) => handleUpdateDetails('title', e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='desc'>Description</Label>
            <Textarea
              id='desc'
              value={assessment.description || ''}
              onChange={(e) =>
                handleUpdateDetails('description', e.target.value)
              }
              rows={2}
            />
          </div>
          <div className='flex gap-4'>
            <div className='w-1/3 space-y-2'>
              <Label>Purpose</Label>
              <Select
                value={assessment.purpose}
                onValueChange={(v: AssessmentPurpose) =>
                  handleUpdateDetails('purpose', v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_PURPOSES.map((p) => (
                    <SelectItem key={p} value={p} className='flex items-center'>
                      <div className='flex items-center'>
                        <span
                          className={cn(
                            'mr-2 h-2 w-2 rounded-full',
                            getPurposeDotColor(p)
                          )}
                        />
                        <span>{p.replace('-', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='w-1/3 space-y-2'>
              <Label>Subject</Label>
              <Select
                value={getSelectValue(assessment.subject_id)}
                onValueChange={(v) => handleUpdateDetails('subject_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>Select Subject</SelectItem>
                  {(subjects.length > 0
                    ? subjects.map((s) => s.id)
                    : SUBJECT_IDS
                  ).map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='w-1/3 space-y-2'>
              <Label>Module</Label>
              <Select
                value={getSelectValue(assessment.module_id)}
                onValueChange={(v) => handleUpdateDetails('module_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>Select Module</SelectItem>
                  {MODULE_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* [FIX] Multi-Select for Assessment Bloom Levels */}
          <div className='space-y-2 pt-2'>
            <Label>Target Bloom's Levels</Label>
            <div className='bg-muted/10 grid grid-cols-2 gap-2 rounded-md border p-4'>
              {BLOOM_LEVELS.map((level) => (
                <div key={level} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`bloom-${level}`}
                    checked={assessment.bloom_levels?.includes(level)}
                    onCheckedChange={(checked) =>
                      handleBloomChange(level, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`bloom-${level}`}
                    className='cursor-pointer font-normal'
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className='text-muted-foreground flex justify-between text-sm'>
          <span>Total Questions: {questions.length}</span>
          <span>Total Points: {totalPoints}</span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ListOrdered size={18} /> Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {questions.length === 0 && (
              <p className='text-muted-foreground text-center italic'>
                No questions added yet.
              </p>
            )}
            {questions.map((question: Question) => (
              <QuestionEditor
                key={question.question_id}
                question={question}
                onUpdate={handleUpdateQuestion}
                onDelete={() => handleDeleteQuestion(question.question_id)}
              />
            ))}
          </div>
          <div className='mt-6 flex justify-end'>
            <Button
              onClick={() => handleAddQuestion('multiple_choice')}
              variant='outline'
              className='border-dashed'
            >
              Add New Question
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          <div className='w-full pt-4'>
            <Button onClick={handleSave} className='w-full'>
              Save Changes
            </Button>
          </div>
          {isVerificationMode && (
            <div className='flex w-full gap-2'>
              <Button
                variant='secondary'
                className='flex-1'
                onClick={() => assessment && onApprove?.(assessment)}
              >
                Approve
              </Button>
              <Button
                variant='destructive'
                className='flex-1'
                onClick={() => onReject?.()}
              >
                Reject
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
