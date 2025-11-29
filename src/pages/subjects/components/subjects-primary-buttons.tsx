import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubjects } from './subjects-provider'
import { usePermissions } from '@/hooks/use-permissions' // <-- Import permissions

export function SubjectsPrimaryButtons() {
  const { setOpen } = useSubjects()
  const { canCreateSubject } = usePermissions() // <-- Check Admin permission for Subject creation

  if (!canCreateSubject) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Subject</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}