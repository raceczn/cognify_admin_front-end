import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'

export function ModulesPrimaryButtons() {
  const navigate = useNavigate()
  const { canCreateModule } = usePermissions()

  if (!canCreateModule) {
    return null
  }

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={() => navigate({ to: '/modules/new' })}
      >
        <span>Add Module</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}
