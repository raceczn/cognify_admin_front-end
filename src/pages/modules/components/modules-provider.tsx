import React, { useState, useCallback, useEffect } from 'react'
import { 
  getModules, 
  createModule, 
  updateModule, 
  deleteModule 
} from '@/lib/modules-hooks'
import { getAllSubjects } from '@/lib/subjects-hooks'
import useDialogState from '@/hooks/use-dialog-state'
import { type Module } from '../data/schema'
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'

type ModulesDialogType = 'add' | 'edit' | 'delete'
type SubjectOption = { id: string; title: string }

type ModulesContextType = {
  open: ModulesDialogType | null
  setOpen: (str: ModulesDialogType | null) => void
  currentRow: Module | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Module | null>>
  modules: Module[]
  subjects: SubjectOption[]
  loadModules: () => Promise<void>
  isLoading: boolean
  isLoadingSubjects: boolean

  // Expose Mutations
  createModuleMutation: UseMutationResult<any, Error, Partial<Module>>
  updateModuleMutation: UseMutationResult<any, Error, { id: string; data: Partial<Module> }>
  deleteModuleMutation: UseMutationResult<any, Error, string>
}

const ModulesContext = React.createContext<ModulesContextType | null>(null)

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ModulesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Module | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)

  const queryClient = useQueryClient()

  const loadModules = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getModules()
      setModules(Array.isArray(res) ? res : res.items || [])
    } catch (err) {
      console.error('Failed to load modules:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoadingSubjects(true)
      const res = await getAllSubjects()
      const options = res.items.map(s => ({ id: s.id, title: s.title }))
      setSubjects(options)
    } catch (err) {
      console.error('Failed to load subjects:', err)
    } finally {
      setIsLoadingSubjects(false)
    }
  }, [])

  // --- Mutations ---
  const createModuleMutation = useMutation({
    mutationFn: createModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      loadModules()
    }
  })

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Module> }) => updateModule({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      loadModules()
    }
  })

  const deleteModuleMutation = useMutation({
    mutationFn: deleteModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      loadModules()
      toast.success("Module deleted")
    }
  })

  useEffect(() => {
    loadModules()
    loadSubjects()
  }, [loadModules, loadSubjects])

  return (
    <ModulesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        modules,
        subjects,
        loadModules,
        isLoading,
        isLoadingSubjects,
        createModuleMutation,
        updateModuleMutation,
        deleteModuleMutation
      }}
    >
      {children}
    </ModulesContext.Provider>
  )
}

export const useModules = () => {
  const context = React.useContext(ModulesContext)
  if (!context)
    throw new Error('useModules must be used within <ModulesProvider>')
  return context
}