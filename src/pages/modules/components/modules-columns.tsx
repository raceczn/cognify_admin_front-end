import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, FileText, ArrowUpDown, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Module } from '../data/schema' // <--- Use the canonical Module type

// CHANGE: Export columns as a function that accepts the edit/delete handlers
export const columns = (
    onEdit: (module: Module) => void,
    onDelete: (module: Module) => void // Enforce delete handler presence
): ColumnDef<Module>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "subject_id",
    header: "Subject",
    cell: ({ row }) => <span className="font-medium">{row.getValue("subject_id")}</span>,
  },
  {
    accessorKey: "bloom_level",
    header: "Bloom Level",
    cell: ({ row }) => <div className="font-medium">{row.getValue("bloom_level")}</div>,
  },
  {
    accessorKey: "material_url", // Use material_url to infer type
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.material_url ? 'File/URL' : 'Text'}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const module = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(module.id)}
            >
              Copy Module ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(module)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={() => onDelete(module)} // <-- FIXED delete call
                className="text-red-600"
            >
                <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]