import { useAssessments } from './assessments-provider'
import { AssessmentsDeleteDialog } from './assessments-delete-dialog'

export function AssessmentsDialogs() {
  const { open } = useAssessments()

  return (
    <>
      {open === 'delete' && <AssessmentsDeleteDialog />}
    </>
  )
}