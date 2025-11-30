// src/pages/subjects/components/subjects-dialogs.tsx
import { useSubjects } from './subjects-provider'
import { SubjectDeleteDialog } from './subjects-delete-dialog'

export function SubjectsDialogs() {
  const { open, setOpen, currentRow } = useSubjects()

  return (
    <>
      {currentRow && (
        <>
          <SubjectDeleteDialog
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen(null)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
