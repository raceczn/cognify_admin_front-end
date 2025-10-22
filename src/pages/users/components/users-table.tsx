import { useEffect, useMemo, useState } from 'react'
// 👈 --- MODIFIED: Added useMemo
import {
  type SortingState,
  type VisibilityState,
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
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
// ❗️ --- REMOVED: No longer need static roles
// import { roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

declare module '@tanstack/react-table' {
  //
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type DataTableProps = {
  data: User[]
  search: Record<string, unknown>
  navigate: NavigateFn
  showDeleted?: boolean
}

export function UsersTable({
  data,
  search,
  navigate,
  showDeleted = false,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({}) //
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({}) //
  const [sorting, setSorting] = useState<SortingState>([])

  // Filter out deleted users unless explicitly shown
  const filteredData = useMemo(() => {
    if (showDeleted) return data
    return data.filter((user) => !user.deleted)
  }, [data, showDeleted]) //

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      // ---------------------------------
      // MODIFIED: Search key changed to 'email' (from your data)
      // ---------------------------------
      { columnId: 'email', searchKey: 'email', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })

  // ---------------------------------
  // MODIFIED: Dynamically create role options from data
  // ---------------------------------
  const roleOptions = useMemo(() => {
    // 1. Get all unique role strings (e.g., "student", "faculty_member")
    const roles = new Set(data.map((user) => user.role).filter(Boolean))

    // 2. Format them for the filter component
    return Array.from(roles).map((role) => {
      // This is the formatting logic you requested:
      // "faculty_member" -> ["faculty", "member"] -> ["Faculty", "Member"] -> "Faculty Member"
      const label = role
        .split('_') // Split by underscore
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1)) // Capitalize first letter
        .join(' ') // Join with a space

      return {
        label: label, // "Faculty Member"
        value: role, // "faculty_member"
      }
    })
  }, [data])
  // ---------------------------------

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
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

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange]) //

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        // ---------------------------------
        // MODIFIED: Updated placeholder and searchKey to email
        // ---------------------------------
        searchPlaceholder='Filter by email...'
        searchKey='email'
        // ---------------------------------
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Online', value: 'online' },
              { label: 'Offline', value: 'offline' }, // 'offline' comes from your data
            ],
          },
          {
            // ---------------------------------
            // MODIFIED: Use new dynamic roleOptions
            // ---------------------------------
            columnId: 'role',
            title: 'Role',
            options: roleOptions,
            // ---------------------------------
          },
        ]}
      />
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
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className ?? ''
                      )}
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
