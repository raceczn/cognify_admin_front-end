// src/pages/modules/components/modules-delete-dialog.tsx
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteModule } from '@/lib/modules-hooks'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Module } from '../data/schema'
import { useModules } from './modules-provider'

type ModuleDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Module
}

export function ModuleDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ModuleDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { loadModules } = useModules()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteModule(currentRow.id)
      onOpenChange(false)
      toast.success(`Module "${currentRow.title}" has been deleted.`)
      loadModules() // Refresh table
    } catch (error: any) {
      console.error('Error deleting module:', error)
      toast.error(
        error.response?.data?.detail ||
          'Failed to delete module. Please try again.'
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
      disabled={isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Module
        </span>
      }
      desc={
        <p>
          Are you sure you want to delete the module:{' '}
          <strong className='break-all'>{currentRow.title}</strong>?
          <br />
          This action will perform a soft-delete.
        </p>
      }
      confirmText='Delete'
      destructive
      isLoading={isLoading}
    />
  )
}
