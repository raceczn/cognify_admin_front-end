import { Link } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UsersPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button asChild className='space-x-1'>
        <Link to='/admin/whitelisting'>
          <span>Manage Whitelist</span>
          <UserPlus size={18} />
        </Link>
      </Button>
    </div>
  )
}