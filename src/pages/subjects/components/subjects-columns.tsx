// src/pages/subjects/components/subjects-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Subject } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const subjectsColumns: ColumnDef<Subject>[] = [
  {
    accessorKey: 'subject_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subject ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-xs'>{row.getValue('subject_id')}</LongText>
    ),
  },
  {
    accessorKey: 'subject_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subject Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-xs'>{row.getValue('subject_name')}</LongText>
    ),
  },
  {
    accessorKey: 'pqf_level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PQF Level' />
    ),
    cell: ({ row }) => <span>{row.getValue('pqf_level') || 'N/A'}</span>,
  },
  {
    accessorKey: 'active_tos_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active TOS' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-xs'>
        {row.getValue('active_tos_id') || 'None'}
      </LongText>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]