// src/pages/modules/components/modules-dialogs.tsx
import { ModuleDeleteDialog } from './modules-delete-dialog'
import { useModules } from './modules-provider'

export function ModulesDialogs() {
  const { open, setOpen, currentRow } = useModules()

  return (
    <>
      {currentRow && (
        <>
          <ModuleDeleteDialog
            key={`module-delete-${currentRow?.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen(null) // Close by setting to null
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
