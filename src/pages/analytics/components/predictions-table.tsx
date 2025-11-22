'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { Loader2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LongText } from '@/components/long-text'

interface Prediction {
  student_id: string
  first_name: string | null
  last_name: string | null
  predicted_to_pass: boolean
  overall_score: number
}

interface PredictionData {
  summary: {
    total_students_predicted: number
    count_predicted_to_pass: number
    count_predicted_to_fail: number
    predicted_pass_rate: number
  }
  predictions: Prediction[]
}

interface PredictionsTableProps {
  data: PredictionData | null | undefined
  isLoading: boolean
  error: Error | null
}

export function PredictionsTable({
  data,
  isLoading,
  error,
}: PredictionsTableProps) {
  const navigate = useNavigate()
  
  // --- FIX 1: Hooks MUST be at the top level (unconditional) ---
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Prediction>[] = [
    {
      accessorKey: 'student_id',
      header: 'Student',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>
              {`${p.first_name || ''} ${p.last_name || ''}`.trim() ||
                'Unknown User'}
            </span>
            <LongText className='text-muted-foreground w-48 text-xs'>
              {p.student_id}
            </LongText>
          </div>
        )
      },
    },
    {
      accessorKey: 'predicted_to_pass',
      header: 'Prediction',
      cell: ({ row }) => {
        const p = row.original
        return (
          <Badge
            variant='outline'
            className='text-muted-foreground flex items-center gap-1.5 px-2 py-0.5 text-sm'
          >
            {p.predicted_to_pass ? (
              <CheckCircle2 className='h-4 w-4 text-green-500 dark:text-green-400' />
            ) : (
              <XCircle className='h-4 w-4 text-red-500 dark:text-red-400' />
            )}
            {p.predicted_to_pass ? 'Predicted to Pass' : 'At Risk'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'overall_score',
      header: () => <div className='text-right'>Overall Score</div>,
      cell: ({ row }) => {
        const p = row.original
        // --- FIX 2: Safe access to score (handle null/undefined) ---
        const score = typeof p.overall_score === 'number' ? p.overall_score : 0
        
        return (
          <div className='flex flex-col items-end gap-1'>
            <span className='font-semibold'>{score.toFixed(2)}%</span>
            <Progress
              value={score}
              className={`h-2 w-[120px] ${p.predicted_to_pass ? 'bg-green-100' : 'bg-red-100'}`}
            />
          </div>
        )
      },
    },
  ]

  // --- FIX 3: Initialize table unconditionally ---
  const table = useReactTable({
    data: data?.predictions || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  // --- FIX 4: Conditional Rendering happens AFTER hooks ---
  if (isLoading) {
    return (
      <Card className='bg-background/60 border-border/50 border shadow-sm backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='text-primary h-5 w-5' />
             Pass/Fail Predictions
          </CardTitle>
          <CardDescription>
            Loading analytics...
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[220px] items-center justify-center'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className='border-border/50 border shadow-sm'>
        <CardHeader>
          <CardTitle>Pass/Fail Predictions</CardTitle>
          <CardDescription>Could not load model data.</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[220px] items-center justify-center'>
          <span className='text-destructive'>
            {error?.message || 'Failed to load predictions.'}
          </span>
        </CardContent>
      </Card>
    )
  }

  // Render Table
  return (
    <Card className='border-border/50 bg-background/70 border shadow-sm backdrop-blur-sm'>
      <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='text-primary h-5 w-5' />
            Pass/Fail Predictions
          </CardTitle>
          <CardDescription>
            Click on a student row to view detailed analytics.
          </CardDescription>
        </div>
        <div className='mt-3 flex flex-wrap gap-2 md:mt-0'>
          <Badge variant='outline'>
            Total: {data.summary.total_students_predicted}
          </Badge>
          <Badge variant='success'>
            Pass: {data.summary.count_predicted_to_pass}
          </Badge>
          <Badge variant='destructive'>
            Fail: {data.summary.count_predicted_to_fail}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader className='bg-[#faf1e8]'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => navigate({ to: '/analytics/student/$studentId', params: { studentId: row.original.student_id } })}
                    className='hover:bg-muted/60 cursor-pointer transition-all hover:shadow-sm'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='text-muted-foreground h-24 text-center'>
                    No student predictions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className='flex items-center justify-end space-x-2 py-4'>
           <div className='space-x-2'>
            <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}