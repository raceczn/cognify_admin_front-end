import { UsersMutateDrawer } from './users-mutate-drawer'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, loadUsers } = useUsers()

  return (
    <>
      {/* Add User */}
      <UsersMutateDrawer
        key="user-add"
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        onSuccess={loadUsers} // ✅ auto refresh list after create
      />

      {/* Invite User */}
      <UsersInviteDialog
        key="user-invite"
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          {/* Edit User */}
          <UsersMutateDrawer
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
            onSuccess={loadUsers} // ✅ auto refresh after edit
          />

          {/* Delete User */}
          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
