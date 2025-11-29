import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubjects } from './subjects-provider'

export function SubjectsPrimaryButtons() {
  const { setOpen } = useSubjects()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Subject</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}