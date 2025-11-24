// src/components/QuestionEditor.tsx
import {Trash2, ListOrdered, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Question, QuestionType, Option } from '@/pages/assessments/data/assessment' // Import types

// --- COMPONENT PROPS TYPES ---
interface QuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
}

// --- COMPONENT: QuestionEditor (Part of AssessmentEditor) ---
export function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
  // Utility to get the icon for the question type
  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'multiple_choice':
        return <ListOrdered size={16} className='text-blue-500' />
      default:
        return null
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
    const newOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, text: newText } : opt
    )
    onUpdate({ ...question, options: newOptions })
  }

  const handleCorrectOptionChange = (optionId: string) => {
    const newOptions = question.options.map(opt => ({ 
      ...opt,
      is_correct: opt.id === optionId,
    }))
    onUpdate({ ...question, options: newOptions })
  }

  const handleDeleteOption = (optionId: string) => {
    const newOptions = question.options.filter(opt => opt.id !== optionId) 
    onUpdate({ ...question, options: newOptions })
  }

  const handleAddOption = () => {
    const newOption: Option = {
      id: Math.random().toString(36).substring(2, 9), // Simple unique ID
      text: `New Option ${question.options.length + 1}`,
      is_correct: false,
    }
    onUpdate({ ...question, options: [...question.options, newOption] })
  }

  return (
    <Card className='mb-6 shadow-md'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
        <CardTitle className='text-lg flex items-center gap-2'>
          {getTypeIcon(question.type)}
          Question Type: {question.type.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
        </CardTitle>
        <div className='flex gap-2'>
          <Input 
            type='number' 
            value={question.points} 
            onChange={handlePointsChange} 
            className='w-20 text-center'
            min={1}
          />
          <Button variant='destructive' size='icon' onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Textarea
          placeholder='Enter the question text...'
          value={question.text}
          onChange={handleTextChange}
          rows={3}
          className='text-base font-semibold'
        />

        {/* Options for Multiple Choice */}
        {question.type === 'multiple_choice' && (
          <div className='space-y-3 pt-2'>
            <Label className='block text-sm font-medium'>Options</Label>
            {question.options.map((option: Option, index: number) => ( 
              <div key={option.id} className='flex items-center space-x-2'>
                <input
                  type='radio'
                  name={`correct-option-${question.id}`}
                  checked={option.is_correct}
                  onChange={() => handleCorrectOptionChange(option.id)}
                  className='form-radio size-4 text-primary'
                />
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className={cn(option.is_correct && 'border-green-500 ring-1 ring-green-500')}
                />
                <Button 
                  variant='ghost' 
                  size='icon' 
                  onClick={() => handleDeleteOption(option.id)}
                  className='flex-shrink-0'
                >
                  <Trash2 size={14} className='text-muted-foreground hover:text-red-500' />
                </Button>
              </div>
            ))}
            <Button 
                variant='outline' 
                size='sm' 
                onClick={handleAddOption} 
                className='mt-2'
            >
              <PlusCircle size={14} className='mr-2' /> Add Option
            </Button>
          </div>
        )}
      
      </CardContent>
    </Card>
  )
}