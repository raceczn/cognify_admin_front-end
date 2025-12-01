import { ModulesMutateDrawer } from './modules-mutate-drawer'
import { ModuleDeleteDialog } from './modules-delete-dialog'
import { useModules } from './modules-provider'

export function ModulesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useModules()
  
  // Helper to ensure row is cleared after closing a dialog
  const handleClose = () => {
    setOpen(null);
    // Use a small delay to clear currentRow *after* dialog transition starts
    setTimeout(() => setCurrentRow(null), 300) 
  }

  return (
    <>
      {/* Add/Edit Module Drawer (handles both based on currentRow being null/present) */}
      <ModulesMutateDrawer
        open={open === 'add' || open === 'edit'}
        onOpenChange={(value) => (value ? setOpen('add') : handleClose())} 
        currentRow={currentRow}
      />
      
      {/* Delete Module Dialog */}
      {currentRow && (
        <ModuleDeleteDialog
          open={open === 'delete'}
          onOpenChange={(value) => (value ? setOpen('delete') : handleClose())}
          currentRow={currentRow}
        />
      )}
    </>
  )
}