import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconDots, IconCheck } from '@tabler/icons-react'
import { User } from '../data/schema' // Make sure this path points to your schema.ts

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'user_name',
    header: 'Username',
    cell: ({ row }) => (
      <div className='flex items-center space-x-2'>
        <span className='max-w-[150px] truncate font-medium'>
          {row.getValue('user_name')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className='flex w-[200px] items-center'>
        <span className='truncate'>{row.getValue('email')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      let colorClass = 'bg-gray-500'

      if (role === 'admin') colorClass = 'bg-red-500/10 text-red-500'
      if (role === 'student') colorClass = 'bg-blue-500/10 text-blue-500'
      if (role === 'faculty_member') colorClass = 'bg-orange-500/10 text-orange-500'

      return (
        <Badge variant='outline' className={`${colorClass} border-0 capitalize`}>
          {role.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'is_verified',
    header: 'Status',
    cell: ({ row }) => {
      const verified = row.getValue('is_verified') as boolean
      return (
        <div className='flex items-center space-x-2'>
          {verified ? (
            <Badge variant='secondary' className='bg-green-500/10 text-green-600'>
              <IconCheck className='mr-1 size-3' /> Verified
            </Badge>
          ) : (
            <Badge variant='secondary' className='bg-yellow-500/10 text-yellow-600'>
               Pending
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
              <IconDots className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[160px]'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]