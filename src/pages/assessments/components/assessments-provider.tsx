import React, { useState, useCallback, useEffect } from 'react'
import { 
  getAllAssessments, 
  createAssessment, 
  updateAssessment, 
  deleteAssessment 
} from '@/lib/assessment-hooks' 
import useDialogState from '@/hooks/use-dialog-state'
import { type Assessment } from '../data/schema'
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'

type AssessmentsDialogType = 'add' | 'edit' | 'delete'

type AssessmentsContextType = {
  open: AssessmentsDialogType | null
  setOpen: (str: AssessmentsDialogType | null) => void
  currentRow: Assessment | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Assessment | null>>
  assessments: Assessment[]
  loadAssessments: () => Promise<void>
  isLoading: boolean
  
  // Mutations
  createAssessmentMutation: UseMutationResult<any, Error, Partial<Assessment>>
  updateAssessmentMutation: UseMutationResult<any, Error, { id: string; data: Partial<Assessment> }>
  deleteAssessmentMutation: UseMutationResult<any, Error, string>
}

const AssessmentsContext = React.createContext<AssessmentsContextType | null>(null)

export function AssessmentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AssessmentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Assessment | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const queryClient = useQueryClient()

  // Manual load function to match subjects-provider pattern
  const loadAssessments = useCallback(async () => {
    try {
      setIsLoading(true)
      // The API returns the array directly, so no need for .items check
      const res = await getAllAssessments()
      setAssessments(res)
    } catch (err) {
      console.error('Failed to load assessments:', err)
      toast.error('Failed to load assessments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAssessmentMutation = useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      loadAssessments()
      toast.success('Assessment created successfully')
      setOpen(null)
    }
  })

  const updateAssessmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assessment> }) => updateAssessment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      loadAssessments()
      toast.success('Assessment updated successfully')
      setOpen(null)
    }
  })

  const deleteAssessmentMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      loadAssessments()
      toast.success('Assessment deleted')
      setOpen(null)
    }
  })

  // Initial load
  useEffect(() => {
    loadAssessments()
  }, [loadAssessments])

  return (
    <AssessmentsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        assessments,
        loadAssessments,
        isLoading,
        createAssessmentMutation,
        updateAssessmentMutation,
        deleteAssessmentMutation
      }}
    >
      {children}
    </AssessmentsContext.Provider>
  )
}

export const useAssessments = () => {
  const context = React.useContext(AssessmentsContext)
  if (!context)
    throw new Error('useAssessments must be used within <AssessmentsProvider>')
  return context
}