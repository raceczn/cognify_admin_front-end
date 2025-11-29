// src/pages/modules/components/modules-provider.tsx
import React, { useState, useCallback, useEffect } from 'react'
import { getModules } from '@/lib/content-hooks'
import { getAllSubjects } from '@/lib/subjects-hooks' // This now returns full Subject objects
import useDialogState from '@/hooks/use-dialog-state'
import { type Module } from '../data/schema'

type ModulesDialogType = 'add' | 'edit' | 'delete'

// [FIX] Update local Subject definition to match the new Hook return
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
}

const ModulesContext = React.createContext<ModulesContextType | null>(null)

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ModulesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Module | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)

  const loadModules = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getModules()
      if (res && Array.isArray(res.items)) {
        setModules(res.items)
      } else {
        setModules([])
      }
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
      // [FIX] Map the full Subject object to the simpler shape needed here
      const options = res.items.map(s => ({
        id: s.id,
        title: s.title
      }))
      setSubjects(options)
    } catch (err) {
      console.error('Failed to load subjects:', err)
    } finally {
      setIsLoadingSubjects(false)
    }
  }, [])

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