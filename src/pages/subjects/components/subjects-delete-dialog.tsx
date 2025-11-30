import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSubject } from '@/lib/subjects-hooks'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Subject } from '../data/schema'
import { useSubjects } from './subjects-provider'

type SubjectDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Subject
}

export function SubjectDeleteDialog({ open, onOpenChange, currentRow }: SubjectDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { loadSubjects } = useSubjects()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteSubject(currentRow.id)
      onOpenChange(false)
      toast.success(`Subject "${currentRow.title}" has been deleted.`)
      loadSubjects()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete subject. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='stroke-destructive me-1 inline-block' size={18} /> Delete Subject
        </span>
      }
      desc={
        <p>
          Are you sure you want to delete the subject: <strong className='break-all'>{currentRow.title}</strong>?
        </p>
      }
      confirmText='Delete'
      destructive
      isLoading={isLoading}
    />
  )
}
