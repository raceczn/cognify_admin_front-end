// src/pages/modules/components/data-table-row-actions.tsx
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, FilePenLine, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Module } from '../data/schema'
import { useModules } from './modules-provider'
import { triggerAiGeneration } from '@/lib/content-hooks'
import { toast } from 'sonner'
import { useState } from 'react'

type DataTableRowActionsProps = {
  row: Row<Module>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useModules()
  const [isGenerating, setIsGenerating] = useState(false)
  const module = row.original

  const handleGenerate = async () => {
    setIsGenerating(true)
    toast.loading(`Starting AI generation for "${module.title}"...`)
    try {
      await triggerAiGeneration(module.id)
      toast.success(
        `AI generation complete for "${module.title}". Content is ready.`
      )
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || 'AI generation failed.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onClick={handleGenerate}
            disabled={isGenerating || !module.material_url}
          >
            {isGenerating ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Sparkles className='mr-2 h-4 w-4' />
            )}
            Generate AI Content
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <FilePenLine size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-destructive'
            data-variant='destructive'
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}