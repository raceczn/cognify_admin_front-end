import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '@/lib/profile-hooks'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

export function RoleSelectCell({
  userId,
  role_id,
  currentUser,
}: {
  userId: string
  role_id: string
  currentUser: User
}) {
  const [currentRoleId, setCurrentRoleId] = useState(role_id)
  const [isUpdating, setIsUpdating] = useState(false)
  const { updateLocalUsers } = useUsers()

  const userType = roles.find((r) => r.value === currentRoleId)

  const handleRoleChange = async (newRoleId: string) => {
    if (isUpdating) return

    setIsUpdating(true)
    const prev = currentRoleId
    setCurrentRoleId(newRoleId) // optimistic update

    try {
      const response = await updateProfile(userId, { role_id: newRoleId })

      // Update the user in the global context
      const updatedUser: User = {
        ...currentUser,
        ...response,
        role:
          roles.find((r) => r.value === response.role_id)?.designation ||
          'unknown',
      }

      updateLocalUsers(updatedUser, 'edit')
      toast.success('Role updated successfully')
    } catch (err) {
      // Revert optimistic update on error
      setCurrentRoleId(prev)
      toast.error('Update failed. Try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={currentRoleId}
      onValueChange={handleRoleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className='flex w-32 items-center gap-2'>
        {userType?.icon && (
          <userType.icon size={16} className='text-muted-foreground' />
        )}
        <SelectValue placeholder={userType?.label} />
      </SelectTrigger>

      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            <span className='capitalize'>{r.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
