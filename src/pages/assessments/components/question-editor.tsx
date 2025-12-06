import { Question, QuestionType, Option } from '@/pages/assessments/data/schema'
import { Trash2, ListOrdered, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface QuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
}

export function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
  const getTypeIcon = (type: QuestionType) => {
    const safeType = type || 'multiple_choice';
    switch (safeType) {
      case 'multiple_choice': return <ListOrdered size={16} className='text-blue-500' />
      default: return <ListOrdered size={16} className='text-gray-500' />
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...question, text: e.target.value })
  }

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value)
    onUpdate({ ...question, points: isNaN(points) ? 0 : points })
  }

  const handleOptionChange = (optionId: string, newText: string) => {
    const baseOptions: Option[] = (question.options && question.options.length > 0)
      ? (question.options as Option[])
      : buildOptionsFromChoices(question)
    const newOptions = baseOptions.map(opt => 
      opt.id === optionId ? { ...opt, text: newText } : opt
    )
    onUpdate({ ...question, options: newOptions })
  }

  const handleCorrectOptionChange = (optionId: string) => {
    const baseOptions: Option[] = (question.options && question.options.length > 0)
      ? (question.options as Option[])
      : buildOptionsFromChoices(question)
    const newOptions = baseOptions.map(opt => ({ 
      ...opt,
      is_correct: opt.id === optionId, 
    }))
    onUpdate({ ...question, options: newOptions })
  }

  const handleDeleteOption = (optionId: string) => {
    const baseOptions: Option[] = (question.options && question.options.length > 0)
      ? (question.options as Option[])
      : buildOptionsFromChoices(question)
    const newOptions = baseOptions.filter(opt => opt.id !== optionId)
    onUpdate({ ...question, options: newOptions })
  }

  const handleAddOption = () => {
    const baseOptions: Option[] = (question.options && question.options.length > 0)
      ? (question.options as Option[])
      : buildOptionsFromChoices(question)
    const newOption: Option = {
      id: Math.random().toString(36).substring(2, 9),
      text: `New Option ${baseOptions.length + 1}`,
      is_correct: false,
    }
    onUpdate({ ...question, options: [...baseOptions, newOption] })
  }

  const currentType = question.type || 'multiple_choice';
  const displayOptions: Option[] = (question.options && question.options.length > 0)
    ? (question.options as Option[])
    : buildOptionsFromChoices(question)

  return (
    <Card className='mb-6 shadow-md'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
        <CardTitle className='text-lg flex items-center gap-2'>
          {getTypeIcon(currentType)}
          Question Type: {currentType.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
        </CardTitle>
        <div className='flex gap-2'>
          <Input type='number' value={question.points || 0} onChange={handlePointsChange} className='w-20 text-center' min={1} placeholder="Pts" />
          <Button variant='destructive' size='icon' onClick={onDelete}><Trash2 size={16} /></Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Textarea placeholder='Enter the question text...' value={question.text || ''} onChange={handleTextChange} rows={3} className='text-base font-semibold' />

        {currentType === 'multiple_choice' && (
          <div className='space-y-3 pt-2'>
            <div className="flex justify-between items-center">
              <Label className='block text-sm font-medium'>Options</Label>
              <span className="text-xs text-muted-foreground">Select the correct answer</span>
            </div>
            {(displayOptions || []).map((option: Option, index: number) => ( 
              <div key={option.id || index} className='flex items-center space-x-3'>
                <input
                  type='radio'
                  name={`correct-option-${question.question_id}`}
                  checked={option.is_correct}
                  onChange={() => handleCorrectOptionChange(option.id)}
                  className='h-4 w-4 cursor-pointer text-primary focus:ring-primary'
                  title="Mark as correct answer"
                />
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className={cn(option.is_correct && 'border-green-500 ring-1 ring-green-500 bg-green-50/50')}
                />
                <Button variant='ghost' size='icon' onClick={() => handleDeleteOption(option.id)} className='flex-shrink-0'>
                  <Trash2 size={14} className='text-muted-foreground hover:text-red-500' />
                </Button>
              </div>
            ))}
            <Button variant='outline' size='sm' onClick={handleAddOption} className='mt-2'>
              <PlusCircle size={14} className='mr-2' /> Add Option
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function buildOptionsFromChoices(question: Question): Option[] {
  const qAny = question as any
  const choices: string[] = Array.isArray(qAny?.choices) ? qAny.choices.map((c: any) => String(c)) : []
  if (!choices || choices.length === 0) return []
  const correctRaw: string | undefined = typeof qAny?.correct === 'string' ? qAny.correct : undefined
  const letter = correctRaw ? correctRaw.trim().charAt(0).toUpperCase() : undefined
  const correctIndex = letter ? letter.charCodeAt(0) - 'A'.charCodeAt(0) : -1
  return choices.map((text: string, idx: number) => ({
    id: `choice-${question.question_id || 'q'}-${idx}`,
    text,
    is_correct: idx === correctIndex,
  }))
}
