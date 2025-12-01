import { useNavigate } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { type Assessment } from '@/pages/assessments/data/schema'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { useDeleteAssessmentMutation } from '@/lib/assessment-hooks'
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

export const assessmentsColumns: ColumnDef<Assessment>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
  },
  {
    accessorKey: 'purpose',
    header: 'Type',
    cell: ({ row }) => {
      const purpose = row.getValue('purpose') as string
      return (
        <Badge variant='outline' className='text-xs uppercase'>
          {purpose}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'subject_id',
    header: 'Subject',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('subject_id')}</div>
    ),
  },
  {
    accessorKey: 'total_items',
    header: 'Items',
    cell: ({ row }) => (
      <div className='w-12 text-center'>{row.getValue('total_items')}</div>
    ),
  },
  {
    id: 'verified',
    header: 'Status',
    cell: ({ row }) => {
      const isVerified = !!row.original.is_verified
      return (
        <Badge variant={isVerified ? 'default' : 'secondary'}>
          {isVerified ? 'Verified' : 'Pending'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const assessment = row.original
      const navigate = useNavigate()
      const deleteMutation = useDeleteAssessmentMutation()

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
              onClick={() => navigator.clipboard.writeText(assessment.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: '/assessments/$assessmentId/edit',
                  params: { assessmentId: assessment.id },
                })
              }
            >
              <Pencil className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600'
              onClick={async () => {
                await deleteMutation.mutateAsync(assessment.id)
              }}
            >
              <Trash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
