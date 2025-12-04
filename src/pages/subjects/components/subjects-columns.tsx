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
      <LongText className='text-muted-foreground max-w-[350px] text-sm'>
        {row.getValue('description') || 'No description.'}
      </LongText>
    ),
  },
  {
    id: 'visuals',
    header: 'Style',
    cell: ({ row }) => {
      const iconColor = row.original.icon_color || '#000'
      const iconBg = row.original.icon_bg_color || '#eee'

      return (
        <div className='flex items-center gap-2'>
          <div
            className='flex h-6 w-6 items-center justify-center rounded border text-xs'
            style={{ backgroundColor: iconBg, color: iconColor }}
            title={`Icon: ${row.original.icon_name}`}
          >
            {/* Simple initial as placeholder for actual icon */}
            {row.original.icon_name?.charAt(0).toUpperCase() || 'I'}
          </div>
          <span className='text-muted-foreground text-xs'>
            {row.original.icon_name}
          </span>
        </div>
      )
    },
  },
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
  // {
  //   accessorKey: 'active_tos_id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Active TOS' />
  //   ),
  //   cell: ({ row }) => (
  //     <LongText className='text-muted-foreground max-w-[150px] text-xs'>
  //       {row.getValue('active_tos_id') || 'None'}
  //     </LongText>
  //   ),
  // },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: DataTableRowActions,
  },
]
