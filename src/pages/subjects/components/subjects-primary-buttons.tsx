import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'

export function SubjectsPrimaryButtons() {
  const navigate = useNavigate()
  const { canCreateSubject } = usePermissions()

  if (!canCreateSubject) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={() => navigate({ to: '/subjects/new' })}
      >
        <span>Add Subject</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}
