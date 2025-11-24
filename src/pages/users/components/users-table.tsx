// src/pages/users/components/users-table.tsx
import { useMemo, useState } from 'react'
// import { getRouteApi } from '@tanstack/react-router'
// Keep this for types, but we won't use the hooks
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
import { cn } from '@/lib/utils'
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
import { roles as roleDefinitions } from '../data/data'
import { type User } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

// We can still use the route API type, but we won't use the hooks
// const route = getRouteApi('/_authenticated/users/')

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type DataTableProps = {
  data: User[]
  showDeleted?: boolean
}

export function UsersTable({ data, showDeleted = false }: DataTableProps) {
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

  // Filter out deleted users unless explicitly shown
  const filteredData = useMemo(() => {
    if (showDeleted) return data
    return data.filter((user) => !user.deleted)
  }, [data, showDeleted])

  // --- REMOVE useTableUrlState hook ---

  const roleOptions = useMemo(() => {
    return roleDefinitions.map((role) => ({
      label: role.label,
      value: role.value,
    }))
  }, [])

  const table = useReactTable({
    data: filteredData,
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
  // The table will auto-reset the page index by default now

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by email...'
        searchKey='email'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Online', value: 'online' },
              { label: 'Offline', value: 'offline' },
              { label: 'Busy', value: 'busy' },
            ],
          },
          {
            columnId: 'role_id',
            title: 'Role',
            options: roleOptions,
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
                     
                      className='bg-[#faf1e8] dark:bg-gray-800'
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
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
                    >
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
      <DataTableBulkActions table={table} />
    </div>
  )
}
