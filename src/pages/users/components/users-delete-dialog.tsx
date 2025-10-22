'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProfile } from '@/lib/profile-hooks'
import { showSubmittedData } from '@/lib/show-submitted-data'
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

  const { updateLocalUsers } = useUsers()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return
    try {
      // Call the API
      const response = await deleteProfile(currentRow.id)
      console.log('Deleting user:', currentRow)
      console.log('Deletion response:', response)

      // Transform the response to match User schema
      const updatedUser: User = {
        ...currentRow,
        deleted: true,
        // Update any other fields from response
        ...(response.data || {}),
      }

      // Update local state immediately
      updateLocalUsers(updatedUser, 'edit')

      // Close dialog and show success message
      onOpenChange(false)
      toast.success(
        `${currentRow.first_name} ${currentRow.last_name} has been deleted successfully`
      )

      // For debugging
      showSubmittedData(updatedUser, 'The following user has been deleted:')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(
        error.response?.data?.detail ||
          'Failed to delete user. Please try again.'
      )
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
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
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className='font-bold'>
              {currentRow.role.toUpperCase()}
            </span>{' '}
            from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
