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
  const initialValue = roles.find(r => r.value === currentUser.role)?.value || currentUser.role || role_id

  const [currentRoleValue, setCurrentRoleValue] = useState(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const { updateLocalUsers } = useUsers()

  const userType = roles.find((r) => r.value === currentRoleValue)

  const handleRoleChange = async (newRoleValue: string) => {
    if (isUpdating) return

    setIsUpdating(true)
    const prev = currentRoleValue
    setCurrentRoleValue(newRoleValue) 

    try {
      // FIX: Changed key from 'role_id' to 'role' to match backend schema
      const response = await updateProfile(userId, { role: newRoleValue })

      // [FIXED] Explicitly handle Date conversion
      const updatedUser: User = {
        ...currentUser,
        ...response,
        created_at: new Date(response.created_at || currentUser.created_at),
        updated_at: new Date(),
        role: response.role || newRoleValue || 'unknown',
        deleted_at:
          typeof (response as any)?.deleted_at === 'string'
            ? new Date((response as any).deleted_at)
            : (response as any)?.deleted_at ?? currentUser.deleted_at ?? null,
      }

      updateLocalUsers(updatedUser, 'edit')
      toast.success('Role updated successfully')
    } catch (err) {
      console.error(err)
      setCurrentRoleValue(prev)
      toast.error('Update failed. Try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={currentRoleValue}
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