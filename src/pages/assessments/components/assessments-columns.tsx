import { ColumnDef } from '@tanstack/react-table'
import { type Assessment } from '@/pages/assessments/data/schema'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableRowActions } from './data-table-row-actions'

export const assessmentsColumns = (
  getSubjectTitle?: (id: string) => string
): ColumnDef<Assessment>[] => [
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
         <DataTableColumnHeader column={column} title='Assessment Title' />
       ),
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return (
        <div className='max-w-[280px] truncate font-medium' title={title}>
          {title}
        </div>
      )
    },
  },
   {
    accessorKey: 'subject_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subject' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('subject_id') as string
      const title = getSubjectTitle ? getSubjectTitle(id) : id
        return (
          <Badge
            variant='outline'
            className='text-xs uppercase max-w-[220px] truncate justify-start'
            title={title}
          >
            {title}
          </Badge>
        )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const raw = (row.getValue('type') as string) || ''
      const val = raw.toLowerCase()
      const color =
        val === 'pre-assessment'
          ? 'bg-amber-500'
          : val === 'quiz'
            ? 'bg-blue-500'
            : val === 'post-assessment'
              ? 'bg-green-500'
              : val === 'diagnostic'
                ? 'bg-rose-500'
                : 'bg-muted-foreground'
      return (
        <div className='flex items-center gap-2'>
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
          <span className='capitalize text-muted-foreground'>{raw || 'N/A'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'questions', 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => {
      // [FIX] Backend might not return total_items, so count questions array
      const count = row.original.questions?.length || 0
      return <div className='w-12 text-center'>{count}</div>
    },
  },
  {
    accessorKey: 'bloom_levels',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bloom Level' />
    ),
    cell: ({ row }) => {
      const levels = Array.isArray(row.original.bloom_levels)
        ? row.original.bloom_levels
        : []
      const raw = (levels[0] || '') as string
      const unique = Array.from(new Set(levels.map((l) => String(l).toLowerCase())))
      const additionalCount = Math.max(0, unique.length - (raw ? 1 : 0))
      
      return (
        <div className='flex items-center gap-2'>
          <span className='capitalize text-sm'>{raw || '-'}</span>
          {additionalCount > 0 && (
            <span className='text-muted-foreground text-xs'>+{additionalCount}</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]