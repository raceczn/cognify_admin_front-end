'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { Loader2, TrendingUp, AlertCircle, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs' // [NEW] Import Tabs
import { Prediction } from '@/lib/analytics-hooks'
import { listStudents } from '@/lib/profile-hooks'

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
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [activeTab, setActiveTab] = React.useState('all') // [NEW] Tab State

  const { data: allStudents } = useQuery({
    queryKey: ['studentsListAll'],
    queryFn: () => listStudents(0, 2000),
    staleTime: 1000 * 30,
    refetchOnMount: 'always',
  })

  const combinedPredictions = React.useMemo(() => {
    const base = Array.isArray(data?.predictions) ? (data!.predictions as Prediction[]) : []
    const ids = new Set(base.map(p => String(p.student_id)))
    const extras = (allStudents || [])
      .filter(s => Boolean((s as any)?.is_verified))
      .filter(s => !ids.has(String((s as any).id)))
      .map(s => ({
        student_id: String((s as any).id),
        first_name: (s as any).first_name ?? null,
        last_name: (s as any).last_name ?? null,
        predicted_to_pass: false,
        overall_score: 0,
        risk_level: 'Unknown',
        passing_probability: 0,
      } as Prediction))
    return [...base, ...extras]
  }, [data?.predictions, allStudents])

  // [NEW] Filter Data Logic
  const filteredPredictions = React.useMemo(() => {
    if (!combinedPredictions) return []
    switch (activeTab) {
      case 'passed':
        return combinedPredictions.filter(p => p.predicted_to_pass === true || (p.passing_probability >= 0.75))
      case 'failed':
        return combinedPredictions.filter(p => p.predicted_to_pass === false || (p.passing_probability < 0.75))
      default:
        return combinedPredictions
    }
  }, [combinedPredictions, activeTab])

  const columns: ColumnDef<Prediction>[] = [
    {
      accessorKey: 'student_id',
      header: 'Student',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium'>
            {`${row.original.first_name || ''} ${row.original.last_name || ''}`.trim() || 'Unknown'}
          </span>
          <span className='text-muted-foreground text-xs'>
            {row.original.student_id}
          </span>
        </div>
      ),
      filterFn: (row, _columnId, filterValue) => {
        const q = String(filterValue ?? '').toLowerCase().trim()
        if (!q) return true
        const id = String(row.original.student_id ?? '').toLowerCase()
        const name = `${row.original.first_name ?? ''} ${row.original.last_name ?? ''}`.toLowerCase()
        return id.includes(q) || name.includes(q)
      },
    },
    {
      accessorKey: 'risk_level',
      header: 'Status',
      cell: ({ row }) => {
        const risk = row.original.risk_level?.toLowerCase() || 'unknown';
        let variant = "outline";
        let label = "";
        
        if (risk.includes('low')) { variant = "success"; label = "On Track"; }
        else if (risk.includes('moderate')) { variant = "secondary"; label = "At Risk"; }
        else if (risk.includes('high') || risk.includes('critical')) { variant = "destructive"; label = "Critical"; }
        else { variant = "secondary"; label = "Just Started"; }

        // @ts-ignore - Variant string mapping is safe here
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: 'passing_probability',
      header: 'Probability',
      cell: ({ row }) => {
        const prob = row.original.passing_probability ?? (row.original.overall_score / 100);
        const pct = Math.round(prob * 100);
        
        let color = "bg-red-500";
        if (pct >= 85) color = "bg-green-500";
        else if (pct >= 65) color = "bg-blue-500";
        else if (pct >= 50) color = "bg-yellow-500";

        return (
          <div className="w-[120px]">
             <div className="flex justify-between text-xs mb-1">
               <span>{pct}% Chance</span>
             </div>
             <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
               <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
             </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'overall_score',
      header: () => <div className='text-right'>Avg Score</div>,
      cell: ({ row }) => (
        <div className='text-right font-mono font-medium'>
          {row.original.overall_score.toFixed(1)}%
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredPredictions, // [NEW] Use filtered data
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { 
      sorting,
      columnFilters 
    },
  })

  if (isLoading) {
    return (
      <Card className='h-64 flex items-center justify-center bg-background/60 backdrop-blur'>
        <div className="flex flex-col items-center gap-2">
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
            <p className="text-muted-foreground text-sm">Loading predictions...</p>
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className='border-destructive/20 border bg-destructive/5'>
        <CardContent className='flex h-64 items-center justify-center flex-col gap-2'>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <span className='text-destructive font-medium'>
            {error?.message || 'Failed to load data'}
          </span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-row items-center justify-between'>
            <div>
                <CardTitle className='flex items-center gap-2'>
                    <TrendingUp className='text-primary h-5 w-5' />
                    Performance Predictions
                </CardTitle>
                <CardDescription>AI-driven analysis of student success rates</CardDescription>
            </div>
            <div className="flex gap-2">
                <Badge variant="outline">Total: {combinedPredictions.length}</Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* [NEW] Tabs for Filtering */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
             <TabsList>
                <TabsTrigger value="all">All Students</TabsTrigger>
                <TabsTrigger value="passed" className="text-green-600">On Track</TabsTrigger>
                <TabsTrigger value="failed" className="text-red-600">At Risk</TabsTrigger>
             </TabsList>
             
             {/* Search Input */}
             <div className="flex items-center gap-2 relative">
                <Search className="h-4 w-4 absolute left-2 text-muted-foreground" />
                <Input 
                   placeholder="Search student name or ID..." 
                   value={(table.getColumn('student_id')?.getFilterValue() as string) ?? ''}
                   onChange={(event) => table.getColumn('student_id')?.setFilterValue(event.target.value)}
                   className="pl-8 h-8 w-[200px]"
                />
             </div>
          </div>

          {/* Table Content (Wrapped in TabsContent, but using same table instance) */}
          <TabsContent value="all" className="m-0">
             <DataTableContent table={table} columns={columns} navigate={navigate} />
          </TabsContent>
          <TabsContent value="passed" className="m-0">
             <DataTableContent table={table} columns={columns} navigate={navigate} />
          </TabsContent>
          <TabsContent value="failed" className="m-0">
             <DataTableContent table={table} columns={columns} navigate={navigate} />
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        <div className='flex items-center justify-end space-x-2 py-4'>
            <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper Component for cleaner code
function DataTableContent({ table, columns, navigate }: { table: any, columns: any, navigate: any }) {
    return (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    onClick={() => navigate({ to: '/analytics/student/$studentId', params: { studentId: row.original.student_id } })}
                    className='cursor-pointer hover:bg-muted/50'
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No students found in this category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
    )
}
