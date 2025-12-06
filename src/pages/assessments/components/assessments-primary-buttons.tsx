import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AssessmentsPrimaryButtons() {
  const navigate = useNavigate()

  return (
    <Button
      className='space-x-1'
      onClick={() => navigate({ to: '/assessments/new' })}
    >
      <span>Create Assessment</span>
      <Plus size={18} />
    </Button>
  )
}