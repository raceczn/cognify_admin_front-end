import { type ColumnDef } from '@tanstack/react-table'
import { FileText, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type Module } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useModules } from './modules-provider'

// Helper component to display subject name from ID
const SubjectName = ({ subjectId }: { subjectId: string }) => {
  const { subjects } = useModules()
  const subject = subjects.find((s) => s.id === subjectId)
  return <span>{subject?.title || subjectId}</span>
}

export const modulesColumns: ColumnDef<Module>[] = [
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
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='max-w-xs'>
        <LongText>{row.getValue('title')}</LongText>
      </div>
    ),
  },
  {
    accessorKey: 'subject_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Core Subject' />
    ),
    cell: ({ row }) => (
      <div className='w-48'>
        <LongText>
          <SubjectName subjectId={row.getValue('subject_id')} />
        </LongText>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    // [FIX] Use plural 'bloom_levels' to match schema and backend
    accessorKey: 'bloom_levels', 
    header: 'Bloom Taxonomy',
    cell: ({ row }) => {
      // Safely cast to array, defaulting to empty if null/undefined
      const levels = (row.getValue('bloom_levels') as string[]) || []

      const bloomColors: Record<string, string> = {
        remembering: 'bg-blue-500',
        understanding: 'bg-green-500',
        applying: 'bg-yellow-500',
        analyzing: 'bg-orange-500',
        evaluating: 'bg-purple-500',
        creating: 'bg-pink-500',
      }

      if (levels.length === 0) {
        return <span className="text-muted-foreground text-xs">-</span>
      }

      // [FIX] Logic to maintain row height: Show 2, hide the rest behind a Popover
      const MAX_VISIBLE = 2
      const visibleLevels = levels.slice(0, MAX_VISIBLE)
      const hiddenLevels = levels.slice(MAX_VISIBLE)
      const hasMore = hiddenLevels.length > 0

      return (
        <div className="flex items-center gap-1">
          {visibleLevels.map((level) => {
            const lowerLevel = level.toLowerCase()
            const dotColor = bloomColors[lowerLevel] || 'bg-gray-400'
            return (
              <Badge
                key={level}
                variant='outline'
                className='flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-[10px]'
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                {level}
              </Badge>
            )
          })}
          
          {hasMore && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer px-1.5 text-[10px] hover:bg-muted"
                  title="View all tags"
                >
                  +{hiddenLevels.length}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-xs text-muted-foreground mb-2">
                    All Taxonomy Levels
                  </h4>
                  <div className="flex flex-col gap-2">
                    {levels.map((level) => {
                      const lowerLevel = level.toLowerCase()
                      const dotColor = bloomColors[lowerLevel] || 'bg-gray-400'
                      return (
                        <Badge
                          key={level}
                          variant='outline'
                          className='w-fit flex items-center gap-2 whitespace-nowrap'
                        >
                          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                          {level}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'material_url',
    header: 'Material',
    cell: ({ row }) => {
      const url = row.getValue('material_url') as string | null
      if (url) {
        return (
          <Button variant='link' asChild className='h-auto p-0'>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center'
            >
              <FileText className='mr-2 h-4 w-4' />
              View
            </a>
          </Button>
        )
      }
      return <span className='text-muted-foreground'>No file</span>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => (
      <div className='w-24'>
        {new Date(row.getValue('created_at')).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]