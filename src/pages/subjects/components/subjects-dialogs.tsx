// src/pages/subjects/components/subjects-dialogs.tsx
import { useSubjects } from './subjects-provider'
import { SubjectsMutateDrawer } from './subjects-mutate-drawer'
// Delete dialog is intentionally omitted

export function SubjectsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, loadSubjects } = useSubjects()

  return (
    <>
      <SubjectsMutateDrawer
        key='subject-add'
        open={open === 'add'}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSuccess={loadSubjects}
      />

      {currentRow && (
        <>
          <SubjectsMutateDrawer
            key={`subject-edit-${currentRow?.subject_id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen(null) // Close by setting to null
            }}
            currentRow={currentRow}
            onSuccess={loadSubjects}
          />

          {/* No Delete Dialog */}
        </>
      )}
    </>
  )
}