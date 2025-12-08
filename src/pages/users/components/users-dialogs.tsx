import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { UsersMutateDrawer } from './users-mutate-drawer'
import { useUsers } from './users-provider'
import { UsersPurgeDialog } from './users-purge-dialog'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, loadUsers } = useUsers()

  return (
    <>
      {/* Add User */}
      <UsersMutateDrawer
        key='user-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
        onSuccess={loadUsers}
      />

        <UsersInviteDialog
    key='user-invite'
    open={open === 'invite'}
    onOpenChange={(isOpen) => setOpen(isOpen ? 'invite' : null)}
  />

  {currentRow && (
    <>
      {/* Edit User */}
      <UsersMutateDrawer
        key={`user-edit-${currentRow.id}`}
        open={open === 'edit'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            // Small timeout to allow animation to finish before clearing data
            setTimeout(() => setCurrentRow(null), 200)
          }
        }}
        currentRow={currentRow}
        onSuccess={loadUsers}
      />

      {/* Delete User */}
      <UsersDeleteDialog
        key={`user-delete-${currentRow.id}`}
        open={open === 'delete'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 200)
          }
        }}
        currentRow={currentRow}
      />

      {/* Purge User */}
      <UsersPurgeDialog
        key={`user-purge-${currentRow.id}`}
        open={open === 'purge'}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 200)
          }
        }}
        currentRow={currentRow}
      />
    </>
  )}
</>
   
  )
}