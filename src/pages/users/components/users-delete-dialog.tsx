'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deactivateUser } from '@/lib/profile-hooks'
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

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!open) setValue('')
  }, [open])

  const handleDelete = async () => {
    if (value.trim() !== currentRow.email) {
      toast.error('The email you entered does not match.')
      return
    }

    setIsLoading(true)
    try {
      const response = await deactivateUser(currentRow.id)

      const updatedUser: User = {
        ...currentRow,
        ...response,
        created_at: new Date(response.created_at || currentRow.created_at),
        updated_at: new Date(),
        deleted: Boolean(response.deleted),
        deleted_at: response.deleted_at
          ? new Date(response.deleted_at)
          : new Date(),
        role: response.role || currentRow.role || 'unknown',
      }
      
      updateLocalUsers(updatedUser, 'edit')
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
        <div className='flex items-center gap-2 text-destructive'>
          <AlertTriangle className='size-5' />
          <span className='font-bold'>Delete User Account</span>
        </div>
      }
      desc={
        <div className='flex flex-col gap-4 py-2 text-start'>
          {/* Main Context */}
          <p className='text-muted-foreground text-sm'>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-foreground'>
              {currentRow.first_name} {currentRow.last_name}
            </span>
            ? This action will perform a soft-delete.
          </p>

          {/* Warning Alert */}
          <Alert variant='destructive' className='border-destructive/20 bg-destructive/5 text-destructive [&>svg]:text-destructive'>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className='font-semibold'>Warning</AlertTitle>
            <AlertDescription className='text-xs opacity-90'>
              The user will be disabled and hidden from active lists, but can be restored later.
            </AlertDescription>
          </Alert>

          {/* Confirmation Input */}
          <div className='space-y-3'>
            <Label htmlFor='confirm-email' className='text-sm font-medium'>
              To confirm, type{' '}
              <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-foreground'>
                {currentRow.email}
              </span>{' '}
              below:
            </Label>
            <Input
              id='confirm-email'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter email address'
              autoComplete='off'
              className='font-mono text-sm'
            />
          </div>
        </div>
      }
      confirmText='Delete User'
      destructive
      isLoading={isLoading}
    />
  )
}