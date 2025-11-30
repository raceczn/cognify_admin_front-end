import React, { useState, useCallback, useEffect } from 'react'
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '@/lib/subjects-hooks'
import useDialogState from '@/hooks/use-dialog-state'
import { type Subject } from '../data/schema'
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'

type SubjectsDialogType = 'add' | 'edit' | 'delete'

type SubjectsContextType = {
  open: SubjectsDialogType | null
  setOpen: (str: SubjectsDialogType | null) => void
  currentRow: Subject | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Subject | null>>
  subjects: Subject[]
  loadSubjects: () => Promise<void>
  isLoading: boolean
  
  // Expose Mutations
  createSubjectMutation: UseMutationResult<any, Error, Partial<Subject>>
  updateSubjectMutation: UseMutationResult<any, Error, { id: string; data: Partial<Subject> }>
  deleteSubjectMutation: UseMutationResult<any, Error, string>
}

const SubjectsContext = React.createContext<SubjectsContextType | null>(null)

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SubjectsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Subject | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const queryClient = useQueryClient()

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getAllSubjects()
      setSubjects(res.items || [])
    } catch (err) {
      console.error('Failed to load subjects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // --- Mutations ---
  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      loadSubjects() // Refresh local list
    }
  })

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) => updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      loadSubjects()
    }
  })

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      loadSubjects()
      toast.success("Subject deleted")
    }
  })

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
        createSubjectMutation,
        updateSubjectMutation,
        deleteSubjectMutation
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