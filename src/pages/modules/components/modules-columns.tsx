// src/pages/modules/components/modules-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Module } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Check, X, FileText, Bot } from 'lucide-react'
import { useModules } from './modules-provider'
import { Button } from '@/components/ui/button'

// Helper component to display subject name from ID
const SubjectName = ({ subjectId }: { subjectId: string }) => {
  const { subjects } = useModules() //
  const subject = subjects.find((s) => s.subject_id === subjectId)
  return <span>{subject?.subject_name || subjectId}</span>
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
      <DataTableColumnHeader column={column} title='Title'  />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-xs'>{row.getValue('title')}</LongText>
    ),
  },
  {
    accessorKey: 'subject_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Core Subject' />
    ),
    cell: ({ row }) => (
      // --- FIX 1: Added whitespace-normal ---
      <div className='w-32 whitespace-normal'>
        <SubjectName subjectId={row.getValue('subject_id')} />
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
  accessorKey: 'bloom_level',
  header: 'Bloom Level',
  cell: ({ row }) => {
    const level = row.getValue('bloom_level') as string;

    // Map bloom levels to colors
    const bloomColors: Record<string, string> = {
      'remembering': 'bg-blue-500',
      'understanding': 'bg-green-500',
      'applying': 'bg-yellow-500',
      'analyzing': 'bg-orange-500',
      'evaluating': 'bg-purple-500',
      'creating': 'bg-pink-500',
    };

    const dotColor = bloomColors[level] || 'bg-gray-400';

    return (
      <Badge variant='outline' className='whitespace-normal flex items-center gap-2'>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        {level}
      </Badge>
    );
  },
},

  {
    id: 'ai_status',
    header: 'AI Content',
    cell: ({ row }) => {
      const {
        generated_summary_id,
        generated_quiz_id,
        generated_flashcards_id,
      } = row.original
      const hasAll =
        generated_summary_id && generated_quiz_id && generated_flashcards_id
      const hasSome =
        generated_summary_id || generated_quiz_id || generated_flashcards_id

      if (hasAll) {
        return (
          <Badge variant='success'>
            <Check className='mr-1 h-3 w-3' /> Generated
          </Badge>
        )
      }
      if (hasSome) {
        return (
          <Badge variant='secondary'>
            <Bot className='mr-1 h-3 w-3' /> Partial
          </Badge>
        )
      }
      return (
        <Badge variant='outline'>
          <X className='mr-1 h-3 w-3' /> None
        </Badge>
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
          <Button variant='link' asChild className='p-0'>
            <a href={url} target='_blank' rel='noopener noreferrer'>
              <FileText className='mr-2 h-4 w-4' /> View
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