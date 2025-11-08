// src/pages/users/components/users-purge-dialog.tsx
'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { purgeProfile } from '@/lib/profile-hooks' // 1. Use the new hook
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type UserPurgeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

const CONFIRM_WORD = 'PURGE' // 2. Make it a different word

export function UsersPurgeDialog({
  open,
  onOpenChange,
  currentRow,
}: UserPurgeDialogProps) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateLocalUsers } = useUsers()

  const handlePurge = async () => {
    if (value.trim() !== CONFIRM_WORD) { // 3. Check for "PURGE"
      toast.error(`The word you entered does not match.`)
      return
    }
    
    setIsLoading(true)
    try {
      // 4. Call the purge API
      await purgeProfile(currentRow.id)

      // 5. Update local state with 'purge' action
      updateLocalUsers(currentRow, 'purge') 

      // 6. Close dialog and show success
      onOpenChange(false)
      toast.success(
        `${currentRow.first_name} ${currentRow.last_name} has been PERMANENTLY purged.`
      )
    } catch (error: any) {
      console.error('Error purging user:', error)
      toast.error(
        error.response?.data?.detail ||
          'Failed to purge user. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handlePurge}
      disabled={value.trim() !== CONFIRM_WORD || isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          PERMANENTLY Purge User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            You are about to permanently delete{' '}
            <span className='font-bold'>{`${currentRow.first_name} ${currentRow.last_name}`}</span>.
            <br />
            This will delete their auth account and ALL associated data (activities, reports, etc).
            <br />
            <strong className='text-destructive'>This action cannot be undone.</strong>
          </p>

          <Label className='my-2'>
            Type the word <span className='font-bold text-destructive'>{CONFIRM_WORD}</span> to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Type "PURGE" to confirm.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>CRITICAL WARNING</AlertTitle>
            <AlertDescription>
              You are about to erase all data for this user. This is irreversible.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Purge User'
      destructive
      isLoading={isLoading}
    />
  )
}