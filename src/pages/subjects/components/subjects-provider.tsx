// src/pages/subjects/components/subjects-provider.tsx
import React, { useState, useCallback, useEffect } from 'react'
import { getAllSubjects } from '@/lib/subjects-hooks'
import useDialogState from '@/hooks/use-dialog-state'
import { type Subject } from '../data/schema'

type SubjectsDialogType = 'add' | 'edit' | 'delete'

type PaginatedSubjectsResponse = {
  items: Subject[]
  last_doc_id: string | null
}

type SubjectsContextType = {
  open: SubjectsDialogType | null
  setOpen: (str: SubjectsDialogType | null) => void
  currentRow: Subject | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Subject | null>>
  subjects: Subject[]
  loadSubjects: () => Promise<void>
  isLoading: boolean
}

const SubjectsContext = React.createContext<SubjectsContextType | null>(null)

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SubjectsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Subject | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const res: PaginatedSubjectsResponse = await getAllSubjects()
      if (res && Array.isArray(res.items)) {
        setSubjects(res.items)
      } else {
        setSubjects([])
      }
    } catch (err) {
      console.error('Failed to load subjects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  return (
    <SubjectsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        subjects,
        loadSubjects,
        isLoading,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  )
}

export const useSubjects = () => {
  const context = React.useContext(SubjectsContext)
  if (!context)
    throw new Error('useSubjects must be used within <SubjectsProvider>')
  return context
}