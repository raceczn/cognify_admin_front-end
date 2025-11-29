import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModules } from './modules-provider'

export function ModulesPrimaryButtons() {
  const { setOpen } = useModules()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Module</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}