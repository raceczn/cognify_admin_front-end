// src/pages/modules/components/modules-table.tsx
import { useMemo, useState } from 'react'
// import { getRouteApi } from '@tanstack/react-router' // Remove
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  // Import this
  type PaginationState,
  // Import this
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
// --- REMOVE useTableUrlState ---
// import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Module } from '../data/schema'
import { modulesColumns as columns } from './modules-columns'
import { useModules } from './modules-provider'

// const route = getRouteApi('/_authenticated/modules') // Remove

type DataTableProps = {
  data: Module[]
  // --- REMOVE search and navigate ---
  // search: Record<string, unknown>
  // navigate: NavigateFn
}

export function ModulesTable({ data }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // --- REVERT PAGINATION & FILTERS TO LOCAL STATE ---
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  // --- END REVERT ---

  const { subjects } = useModules() //

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({
      label: s.subject_name,
      value: s.subject_id,
    }))
  }, [subjects])

  // --- REMOVE useTableUrlState hook ---

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination, // Use local state
      rowSelection,
      columnFilters, // Use local state
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange: setPagination, // Use local state setter
    onColumnFiltersChange: setColumnFilters, // Use local state setter
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // --- REMOVE the ensurePageInRange useEffect ---

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by title...'
        searchKey='title'
        filters={[
          {
            columnId: 'subject_id',
            title: 'Subject',
            options: subjectOptions,
          },
        ]}
      />
      {/* ... (rest of table JSX is unchanged) ... */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className='bg-[#faf1e8]' 
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
