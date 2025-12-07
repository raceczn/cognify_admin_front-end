import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Subject } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Checkbox } from '@/components/ui/checkbox'

export const subjectsColumns: ColumnDef<Subject>[] = [
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subject Title' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col space-y-1'>
        <span className='max-w-[300px] truncate font-medium'>
          {row.getValue('title')}
        </span>
        <span className='text-muted-foreground font-mono text-xs'>
          {row.original.id}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      // [FIX] Increased max-width to 500px since we removed other columns
      <LongText className='text-muted-foreground max-w-[500px] text-sm'>
        {row.getValue('description') || 'No description.'}
      </LongText>
    ),
  },
  // [REMOVED] Topics Column
  // [REMOVED] Visuals (Style) Column
  {
    accessorKey: 'pqf_level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PQF level' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <span className='bg-secondary text-secondary-foreground inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
          {row.getValue('pqf_level') || 'N/A'}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: DataTableRowActions,
  },
]