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
        onOpenChange={(value) => setOpen(value ? 'add' : null)} // ✅ proper toggle
        onSuccess={loadUsers} // ✅ auto refresh list after create
      />

      {/* Invite User */}
      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />
      {currentRow && (
        <>
          {/* Edit User */}
          <UsersMutateDrawer
            key={`user-edit-${currentRow?.id ?? 'unknown'}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
            onSuccess={loadUsers}
          />

          {/* Delete User */}
          <UsersDeleteDialog
            key={`user-delete-${currentRow?.id ?? 'unknown'}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <UsersPurgeDialog
            key={`user-purge-${currentRow?.id ?? 'unknown'}`}
            open={open === 'purge'}
            onOpenChange={() => {
              setOpen(null) // Set to null to close
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
