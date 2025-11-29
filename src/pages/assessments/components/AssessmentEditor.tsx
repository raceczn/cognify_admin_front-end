import { useState, useEffect } from 'react'
import {
  Assessment,
  Question,
  QuestionType,
  AssessmentPurpose,
  Option,
} from '@/pages/assessments/data/assessment'
import { Pencil, ListOrdered, Loader2, ArrowLeft } from 'lucide-react' // Added ArrowLeft
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
import { cn } from '@/lib/utils'
import { QuestionEditor } from './QuestionEditor'

interface AssessmentEditorProps {
  assessment: Assessment | null | undefined
  onUpdateAssessment: (assessment: Assessment) => void
  onBack?: () => void // [FIX] Added optional onBack prop
}

const SUBJECT_IDS = ['SUBJ_PSYCH', 'SUBJ_DEV_PSYCH', 'SUBJ_ABNORMAL_PSYCH', 'SUBJ_IO_PSYCH', 'SUBJ_PSYC_ASSESS']
const MODULE_IDS = ['MOD_COG101', 'MOD_PERS202', 'MOD_MOTIVATION302']

const ASSESSMENT_PURPOSES: AssessmentPurpose[] = [
  'Pre-Test',
  'Quiz',
  'Post-Test',
  'Practice_Exam',
  'Diagnostic',
]

const CLEAR_VALUE = 'clear-selection'

const getPurposeDotColor = (purpose: AssessmentPurpose): string => {
  switch (purpose) {
    case 'Practice_Exam': return 'bg-[#63A361]'
    case 'Post-Test': return 'bg-[#8CA9FF]'
    case 'Pre-Test': return 'bg-[#FFA239]'
    case 'Diagnostic': return 'bg-[#D34E4E]'
    case 'Quiz': return 'bg-gray-400'
    default: return 'bg-gray-500'
  }
}

export function AssessmentEditor({
  assessment: initialAssessment,
  onUpdateAssessment,
  onBack, // [FIX] Destructure onBack
}: AssessmentEditorProps) {
  const [assessment, setAssessment] = useState<Assessment | null | undefined>(initialAssessment)

  useEffect(() => {
    if (initialAssessment) {
      // Normalize questions logic (Keep existing logic)
      const normalizedQuestions = (initialAssessment.questions || []).map((q: any) => {
        let normalizedOptions: Option[] = [];
        if (Array.isArray(q.options) && q.options.length > 0) {
          if (typeof q.options[0] === 'string') {
            normalizedOptions = q.options.map((optText: string, idx: number) => ({
              id: `opt-${q.question_id}-${idx}`, 
              text: optText,
              is_correct: optText === q.answer 
            }));
          } else {
            normalizedOptions = q.options;
          }
        }
        return {
          ...q,
          question_id: q.question_id || q.id || Math.random().toString(36).substring(2, 9),
          text: q.text || q.question || '', 
          type: q.type || 'multiple_choice',
          points: q.points || 1,
          options: normalizedOptions
        };
      });
      setAssessment({ ...initialAssessment, questions: normalizedQuestions });
    } else {
      setAssessment(initialAssessment);
    }
  }, [initialAssessment])

  const handleSave = () => {
    if (!assessment) return;
    // (Keep existing save logic)
    const payloadQuestions = (assessment.questions || []).map((q) => {
      const correctOpt = q.options.find((opt) => opt.is_correct);
      return {
        ...q,
        question: q.text, 
        options: q.options.map((opt) => opt.text),
        answer: correctOpt ? correctOpt.text : '',
        topic_title: (q as any).topic_title,
        bloom_level: (q as any).bloom_level,
      }
    });
    const payload = {
      ...assessment,
      questions: payloadQuestions,
      updated_at: new Date().toISOString(),
    };
    onUpdateAssessment(payload as any);
  }

  if (!assessment) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading assessment...</span>
      </div>
    )
  }

  // (Keep existing handlers: handleUpdateDetails, handleAddQuestion, etc.)
  const handleUpdateDetails = (field: keyof Assessment, value: any) => {
    const finalValue = value === CLEAR_VALUE ? undefined : value
    setAssessment((prev) => prev ? { ...prev, [field]: finalValue } : prev)
  }
  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      question_id: Math.random().toString(36).substring(2, 9),
      type: type,
      text: `[New ${type.replace('_', ' ')}]`,
      points: 1,
      options: [{ id: 'op1', text: 'Option 1', is_correct: true }, { id: 'op2', text: 'Option 2', is_correct: false }],
    }
    setAssessment((prev) => prev ? { ...prev, questions: [...(prev.questions || []), newQuestion] } : prev)
  }
  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setAssessment((prev) => {
      if (!prev) return prev
      const newQuestions = (prev.questions || []).map((q) => q.question_id === updatedQuestion.question_id ? updatedQuestion : q)
      return { ...prev, questions: newQuestions }
    })
  }
  const handleDeleteQuestion = (qId: string) => {
    setAssessment((prev) => {
      if (!prev) return prev
      return { ...prev, questions: (prev.questions || []).filter((q) => q.question_id !== qId) }
    })
  }

  const questions = assessment.questions || []
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  const getSelectValue = (value: string | undefined): string => value === undefined ? CLEAR_VALUE : value

  return (
    <div className='space-y-6 p-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              {/* [FIX] Back Button */}
              {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mr-1">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Pencil size={18} /> Assessment Details
            </CardTitle>
          </div>
          <CardDescription>Edit the core information.</CardDescription>
        </CardHeader>
        {/* ... Keep Content ... */}
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' value={assessment.title || ''} onChange={(e) => handleUpdateDetails('title', e.target.value)} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='desc'>Description</Label>
            <Textarea id='desc' value={assessment.description || ''} onChange={(e) => handleUpdateDetails('description', e.target.value)} rows={2} />
          </div>
          <div className='flex gap-4'>
            <div className='w-1/3 space-y-2'>
              <Label>Purpose</Label>
              <Select value={assessment.purpose} onValueChange={(v: AssessmentPurpose) => handleUpdateDetails('purpose', v)}>
                <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                <SelectContent>
                  {ASSESSMENT_PURPOSES.map((p) => (
                    <SelectItem key={p} value={p} className="flex items-center">
                      <div className="flex items-center">
                        <span className={cn('w-2 h-2 rounded-full mr-2', getPurposeDotColor(p))} />
                        <span>{p.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Subject/Module Selectors (Keep Existing) */}
            <div className='w-1/3 space-y-2'>
              <Label>Subject</Label>
              <Select value={getSelectValue(assessment.subject_id)} onValueChange={(v) => handleUpdateDetails('subject_id', v)}>
                <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>Select Subject</SelectItem>
                  {SUBJECT_IDS.map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className='w-1/3 space-y-2'>
              <Label>Module</Label>
              <Select value={getSelectValue(assessment.module_id)} onValueChange={(v) => handleUpdateDetails('module_id', v)}>
                <SelectTrigger><SelectValue placeholder='Select' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>Select Module</SelectItem>
                  {MODULE_IDS.map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}
                </SelectContent>
              </Select>
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
          <CardTitle className='flex items-center gap-2'><ListOrdered size={18} /> Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {questions.length === 0 && <p className='text-muted-foreground text-center italic'>No questions added yet.</p>}
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
            <Button onClick={() => handleAddQuestion('multiple_choice')} variant="outline" className="border-dashed">
              Add New Question
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col gap-2'>
          <div className='w-full pt-4'>
            <Button onClick={handleSave} className='w-full'>Save Changes</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}