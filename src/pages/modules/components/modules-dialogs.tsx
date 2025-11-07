// src/pages/modules/components/modules-dialogs.tsx
import { useModules } from './modules-provider'
import { ModulesMutateDrawer } from './modules-mutate-drawer'
import { ModuleDeleteDialog } from './modules-delete-dialog'

export function ModulesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, loadModules } = useModules()

  return (
    <>
      <ModulesMutateDrawer
        key='module-add'
        open={open === 'add'}
        onOpenChange={(value) => setOpen(value ? 'add' : null)}
        onSuccess={loadModules}
      />

      {currentRow && (
        <>
          <ModulesMutateDrawer
            key={`module-edit-${currentRow?.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen(null) // Close by setting to null
            }}
            currentRow={currentRow}
            onSuccess={loadModules}
          />

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