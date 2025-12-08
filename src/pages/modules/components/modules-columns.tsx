// <--- Use the canonical Module type
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  FileText,
  Pencil,
  // Trash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { Module } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'



// CHANGE: Export columns as a function that accepts the edit/delete handlers
export const columns = (
  onEdit: (module: Module) => void,
  // onDelete: (module: Module) => void, // Enforce delete handler presence
  getSubjectTitle?: (id: string) => string
): ColumnDef<Module>[] => [
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
      <DataTableColumnHeader column={column} title='Module Title' />
    ),
    cell: ({ row }) => (
      <div className='lowercase max-w-[300px] truncate'>
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'subject_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subject Title' />
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
    accessorKey: 'bloom_level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bloom Level' />
    ),
    cell: ({ row }) => {
      const levels = Array.isArray(row.original.bloom_levels)
        ? row.original.bloom_levels
        : row.original.bloom_level
          ? [row.original.bloom_level]
          : []
      const raw = (row.original.bloom_level || levels[0] || '') as string
      const lvl = raw.toLowerCase()
      const normalized = levels.map((l) => String(l).toLowerCase())
      const unique = Array.from(new Set(normalized))
      const additionalCount = Math.max(0, unique.length - (unique.includes(lvl) ? 1 : 0))
      const color =
        lvl === 'remembering'
          ? 'bg-gray-400'
          : lvl === 'understanding'
            ? 'bg-blue-500'
            : lvl === 'applying'
              ? 'bg-green-500'
              : lvl === 'analyzing'
                ? 'bg-amber-500'
                : lvl === 'evaluating'
                  ? 'bg-violet-500'
                  : lvl === 'creating'
                    ? 'bg-rose-500'
                    : 'bg-muted-foreground'
      return (
        <div className='flex items-center gap-2'>
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
          <span className='font-medium capitalize'>{raw || 'N/A'}</span>
          {additionalCount > 0 && (
            <span className='text-muted-foreground text-xs'>+({additionalCount})</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'material_url', // Use material_url to infer type
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Material Type' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <FileText className='text-muted-foreground h-4 w-4' />
        <span>{row.original.material_url ? 'File/URL' : 'Text'}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),  
    cell: ({ row }) => {
      const module = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(module.id)}
            >
              Copy Module ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(module)}>
              <Pencil className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              onClick={() => onDelete(module)} // <-- FIXED delete call
              className='text-red-600'
            >
              <Trash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
