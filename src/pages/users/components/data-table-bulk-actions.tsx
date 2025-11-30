import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck } from 'lucide-react' 
import { toast } from 'sonner'
import { updateProfile } from '@/lib/profile-hooks'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'
import { useUsers } from './users-provider'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const { updateLocalUsers } = useUsers()

  const handleBulkStatusChange = async (status: 'online' | 'offline') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    const isActive = status === 'online'

    const promises = selectedUsers.map(async (user) => {
      try {
        const response = await updateProfile(user.id, {
          is_active: isActive,
        })

        // [FIXED] Robust Date conversion for deleted_at
        const updatedUser: User = {
          ...user,
          status: status, 
          ...(response || {}),
          created_at: new Date(response?.created_at || user.created_at),
          updated_at: new Date(),
          role: response?.role || user.role,
          // Handle 'deleted_at' safely: string -> Date, null/undefined -> undefined/null
          deleted_at: response?.deleted_at ? new Date(response.deleted_at) : (user.deleted_at || null),
        }
        
        updateLocalUsers(updatedUser, 'edit')
        return updatedUser
      } catch (error) {
        console.error(`Error updating user ${user.id}:`, error)
        throw error
      }
    })

    toast.promise(Promise.all(promises), {
      loading: `${isActive ? 'Activating' : 'Deactivating'} users...`,
      success: () => {
        table.resetRowSelection()
        return `${isActive ? 'Activated' : 'Deactivated'} ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
      },
      error: `Error ${isActive ? 'activating' : 'deactivating'} users`,
    })
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('online')}
              className='size-8'
              aria-label='Activate selected users'
              title='Activate selected users'
            >
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className='sr-only'>Activate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('offline')}
              className='size-8'
              aria-label='Deactivate selected users'
              title='Deactivate selected users'
            >
              <UserX className="h-4 w-4 text-red-600" />
              <span className='sr-only'>Deactivate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected users'
              title='Delete selected users'
            >
              <Trash2 className="h-4 w-4" />
              <span className='sr-only'>Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}