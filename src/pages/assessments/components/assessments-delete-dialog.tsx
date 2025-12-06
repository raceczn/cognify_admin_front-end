import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAssessments } from './assessments-provider'

export function AssessmentsDeleteDialog() {
  const { open, setOpen, currentRow, deleteAssessmentMutation } = useAssessments()

  const handleDelete = () => {
    if (currentRow?.id) {
      deleteAssessmentMutation.mutate(currentRow.id)
    }
  }

  return (
    <AlertDialog
      open={open === 'delete'}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            assessment <span className='font-bold'>{currentRow?.title}</span> and
            remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAssessmentMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
            disabled={deleteAssessmentMutation.isPending}
          >
            {deleteAssessmentMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}