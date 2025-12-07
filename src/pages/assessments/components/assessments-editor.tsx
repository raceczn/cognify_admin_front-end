import { useState, useEffect } from 'react'
import { CheckedState } from '@radix-ui/react-checkbox'
import { useQuery } from '@tanstack/react-query'
import {
  Assessment,
  Question,
  QuestionType,
  AssessmentPurpose,
  Option,
} from '@/pages/assessments/data/schema'
import {
  Pencil,
  ListOrdered,
  Loader2,
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { getAllSubjects } from '@/lib/subjects-hooks'
import { getModules, getModulesBySubject } from '@/lib/modules-hooks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
// Ensure this import matches your file structure (kebab-case recommended)
import { QuestionEditor } from './question-editor'

interface AssessmentEditorProps {
  assessment: Assessment | null | undefined
  onUpdateAssessment: (assessment: Assessment) => void
  onBack?: () => void
  subjects?: { id: string; title: string }[]
  isVerificationMode?: boolean
  onApprove?: (assessment: Assessment) => void
  onReject?: () => void
}


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

function normalizePurpose(val?: string): AssessmentPurpose | undefined {
  const s = (val ?? '').toString().trim().toLowerCase()
  let hy = s.replace(/[_\s]+/g, '-')
  if (hy === 'preassessment') hy = 'pre-assessment'
  if (hy === 'postassessment') hy = 'post-assessment'

  const allowed: AssessmentPurpose[] = [
    'pre-assessment',
    'quiz',
    'post-assessment',
    'diagnostic',
  ]

  // Safe cast after check
  return allowed.includes(hy as AssessmentPurpose)
    ? (hy as AssessmentPurpose)
    : undefined
}

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
      // Normalize Questions
      const normalizedQuestions = (initialAssessment.questions || []).map(
        (q: any) => {
          const normalizedOptions = normalizeOptions(q)
          return {
            ...q,
            // Ensure ID exists
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

      // Normalize Bloom Levels
      const initLevels = Array.isArray(initialAssessment.bloom_levels)
        ? initialAssessment.bloom_levels
        : []
      const normalizedLevels = Array.from(
        new Set(initLevels.map((l: string) => String(l).toLowerCase()))
      )

      // Normalize Purpose
      const rawPurpose =
        (initialAssessment as any).purpose ?? (initialAssessment as any).type
      const normalizedPurpose = normalizePurpose(rawPurpose)

      setAssessment({
        ...initialAssessment,
        purpose: normalizedPurpose ?? initialAssessment.purpose,
        bloom_levels: normalizedLevels,
        questions: normalizedQuestions,
      })
    } else {
      setAssessment(initialAssessment)
    }
  }, [initialAssessment])

  const handleSave = () => {
    if (!assessment) return

    // Prepare payload questions matching backend expectations if needed
    // Note: The Schema (Assessment) allows `questions` as `Question[]`.
    // If your backend needs specific fields like 'correct' or 'answer', ensure they are mapped here.

    // We stick to the 'Assessment' type for safety.
    const payload: Assessment = {
      ...assessment,
      updated_at: new Date(), // Ensure this is a Date object, the schema handles coercion
    }

    onUpdateAssessment(payload)

    if (isVerificationMode && onApprove) {
      onApprove(payload)
    }
  }

  // [FIX] Correct type for CheckedState (boolean | "indeterminate")
  const handleBloomChange = (level: string, checked: CheckedState) => {
    setAssessment((prev) => {
      if (!prev) return prev
      const currentLevels = (prev.bloom_levels || []).map((l) =>
        String(l).toLowerCase()
      )
      const key = level.toLowerCase()

      let newLevels: string[]

      if (checked === true) {
        newLevels = Array.from(new Set([...currentLevels, key]))
      } else {
        newLevels = currentLevels.filter((l) => l !== key)
      }

      return { ...prev, bloom_levels: newLevels }
    })
  }

  if (!assessment) {
    return (
      <div className='text-muted-foreground flex h-64 items-center justify-center'>
        <Loader2 className='mr-2 h-6 w-6 animate-spin' />
        <span>Loading assessment...</span>
      </div>
    )
  }

  const handleUpdateDetails = (field: keyof Assessment, value: any) => {
    const finalValue = value === CLEAR_VALUE ? undefined : value
    setAssessment((prev) => (prev ? { ...prev, [field]: finalValue } : prev))
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
    setAssessment((prev) => {
      if (!prev) return prev
      const newQuestions = (prev.questions || []).map((q) =>
        q.question_id === updatedQuestion.question_id ? updatedQuestion : q
      )
      return { ...prev, questions: newQuestions }
    })
  }

  const handleDeleteQuestion = (qId?: string) => {
    setAssessment((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        questions: (prev.questions || []).filter((q) => q.question_id !== qId),
      }
    })
  }

  const questions: Question[] = assessment.questions || []
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)

  const getSelectValue = (value: string | null | undefined): string =>
    value == null ? CLEAR_VALUE : value

  // Fallback if subjects prop is missing
  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects:list'],
    queryFn: getAllSubjects,
    enabled: !subjects || subjects.length === 0,
  })

  const subjectOptions =
    subjects && subjects.length > 0
      ? subjects
      : (subjectsRes?.items || []).map((s: any) => ({
          id: s.id,
          title: s.title,
        }))

  const { data: modulesRes } = useQuery({
    queryKey: ['modules:list', assessment.subject_id ?? 'all'],
    queryFn: () =>
      assessment.subject_id ? getModulesBySubject(String(assessment.subject_id)) : getModules(),
  })

  const moduleOptions = Array.isArray(modulesRes)
    ? (modulesRes || []).map((m: any) => ({
        id: m?.id ?? m?.data?.id ?? '',
        title: m?.title ?? m?.data?.title ?? 'Untitled Module',
      }))
    : ((modulesRes?.items || []) as any[]).map((m: any) => ({
        id: m?.id ?? m?.data?.id ?? '',
        title: m?.title ?? m?.data?.title ?? 'Untitled Module',
      }))

  return (
    <div className='space-y-6 p-1'>
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
            {isVerificationMode ? (
              <div className='flex items-center gap-2'>
                <Button
                  variant='secondary'
                  className='border border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700'
                  onClick={() => assessment && onApprove?.(assessment)}
                >
                  <CheckCircle size={16} />
                  Approve
                </Button>

                <Button
                  variant='destructive'
                  className='gap-2'
                  onClick={() => onReject?.()}
                >
                  <XCircle size={16} />
                  Reject
                </Button>
              </div>
            ) : (
              <Button onClick={handleSave} className='gap-2'>
                <Save size={16} /> Save Changes
              </Button>
            )}
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
          <div className='flex flex-col gap-4 md:flex-row'>
            <div className='flex-1 space-y-2'>
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
                        <span className='capitalize'>
                          {p.replace('-', ' ')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex-1 space-y-2'>
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
                  {subjectOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex-1 space-y-2'>
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
                {moduleOptions.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>

          <div className='space-y-2 pt-2'>
            <Label>Target Bloom's Levels</Label>
            <div className='bg-muted/10 grid grid-cols-2 gap-2 rounded-md border p-4'>
              {BLOOM_LEVELS.map((level) => (
                <div key={level} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`bloom-${level}`}
                    checked={(assessment.bloom_levels || [])
                      .map((l) => String(l).toLowerCase())
                      .includes(level.toLowerCase())}
                    onCheckedChange={(checked) =>
                      handleBloomChange(level, checked)
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
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <ListOrdered size={18} /> Questions
            </CardTitle>
            <Button
              onClick={() => handleAddQuestion('multiple_choice')}
              variant='outline'
              size='sm'
              className='border-dashed'
            >
              Add New Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {questions.length === 0 && (
              <p className='text-muted-foreground py-8 text-center italic'>
                No questions added yet. Click "Add New Question" to begin.
              </p>
            )}
            {questions.map((question) => (
              <QuestionEditor
                key={question.question_id}
                question={question}
                onUpdate={handleUpdateQuestion}
                onDelete={() => handleDeleteQuestion(question.question_id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Helpers ---

function toStringArray(src: any): string[] {
  if (!src) return []
  if (Array.isArray(src)) return src.map((x: any) => String(x))
  const s = String(src)
  const parts = s
    .split(/\r?\n|\|/)
    .map((x) => x.trim())
    .filter(Boolean)
  if (parts.length > 0) return parts
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function normalizeOptions(rawQ: any): Option[] {
  // If options is already an array of objects
  if (
    Array.isArray(rawQ?.options) &&
    rawQ.options.length > 0 &&
    typeof rawQ.options[0] === 'object'
  ) {
    return rawQ.options.map((o: any) => ({
      id: o.id ? String(o.id) : Math.random().toString(36).slice(2),
      text: o.text || o.value || '',
      is_correct: !!o.is_correct,
    }))
  }

  // Otherwise parse from strings/arrays
  const arrStrings = toStringArray(
    rawQ?.options ?? rawQ?.choices ?? rawQ?.choice_list ?? rawQ?.options_text
  )

  const base = arrStrings.map((optText: string, idx: number) => ({
    id: `opt-${rawQ?.question_id ?? rawQ?.id ?? 'q'}-${idx}`,
    text: optText,
    is_correct: false,
  }))

  // Try to determine correct answer from other fields if not inside objects
  const correctFromLetter = (() => {
    const raw = rawQ?.correct
    if (typeof raw !== 'string') return undefined
    const s = raw.trim()
    const m = s.match(/^[A-Za-z]/)
    const letter = m ? m[0].toUpperCase() : undefined
    if (!letter) return undefined
    const idx = letter.charCodeAt(0) - 'A'.charCodeAt(0)
    return idx >= 0 && idx < base.length ? idx : undefined
  })()

  // [FIX] Add 'correct_answers' (plural) check for compatibility with backend populate script
  const answerText =
    typeof rawQ?.answer === 'string'
      ? String(rawQ.answer)
      : typeof rawQ?.correct_answer === 'string'
        ? String(rawQ.correct_answer)
        : typeof rawQ?.correct_answers === 'string'
          ? String(rawQ.correct_answers)
          : typeof rawQ?.correct_index === 'number' && base[rawQ.correct_index]
            ? base[rawQ.correct_index].text
            : undefined

  // [FIX] Handle array of correct answers if provided as list
  const correctArr = Array.isArray(rawQ?.correct_answers)
    ? rawQ.correct_answers
    : []

  return base.map((o, i) => ({
    ...o,
    is_correct:
      o.is_correct ||
      (correctFromLetter !== undefined ? i === correctFromLetter : false) ||
      (answerText ? o.text === answerText : false) ||
      correctArr.includes(o.text),
  }))
}
