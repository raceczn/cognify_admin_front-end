import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModules } from './modules-provider'
import { usePermissions } from '@/hooks/use-permissions' // <-- Import permissions

export function ModulesPrimaryButtons() {
  const { setOpen } = useModules()
  const { canCreateModule } = usePermissions() // <-- Check Faculty Member permission for Module creation

  if (!canCreateModule) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Module</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}