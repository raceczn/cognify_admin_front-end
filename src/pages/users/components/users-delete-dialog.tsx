// src/pages/users/components/users-delete-dialog.tsx
'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
// --- FIX: Import the correct hook ---
import { deleteProfile } from '@/lib/profile-hooks'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateLocalUsers } = useUsers()

  const handleDelete = async () => {
    // --- FIX: Use 'email' for confirmation, it's more reliable ---
    if (value.trim() !== currentRow.email) {
      toast.error("The email you entered does not match.")
      return
    }
    
    setIsLoading(true)
    try {
      // 1. Call the soft-delete API
      const response = await deleteProfile(currentRow.id)

      // 2. Update local state immediately
      // The response is the soft-deleted user profile
      const updatedUser: User = {
        ...currentRow,
        ...response.profile, // Merge latest data from backend
        deleted: response.profile.deleted, // Ensure deleted is true
      }
      updateLocalUsers(updatedUser, 'edit') // 'edit' to update status

      // 3. Close dialog and show success
      onOpenChange(false)
      toast.success(
        `${currentRow.first_name} ${currentRow.last_name} has been soft-deleted.`
      )
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(
        error.response?.data?.detail ||
          'Failed to delete user. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email || isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{`${currentRow.first_name} ${currentRow.last_name}`}</span>?
            <br />
            This action will perform a soft-delete. The user can be restored later.
          </p>

          <Label className='my-2'>
            Type the user's email <span className='font-bold text-destructive'>{currentRow.email}</span> to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter user email to confirm deletion.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This will disable the user's account and remove them from active lists.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete User'
      destructive
      isLoading={isLoading}
    />
  )
}