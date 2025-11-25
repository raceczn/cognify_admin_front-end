import { useState, useMemo } from 'react'
import { Assessment, AssessmentPurpose } from '@/pages/assessments/data/assessment'
import { useAssessmentsQuery, useCreateAssessmentMutation, useUpdateAssessmentMutation } from '@/lib/assessment-hooks'
import { toast } from 'sonner'

export function useAssessments() {
  const [search, setSearch] = useState('')
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  // 1. Fetch data from Backend
  const { data: assessments = [], isLoading, isError } = useAssessmentsQuery()
  
  // 2. Mutations
  const createMutation = useCreateAssessmentMutation()
  const updateMutation = useUpdateAssessmentMutation()

  // 3. Filter Logic
  const filteredAssessments = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return assessments
    
    return assessments.filter(
      // FIX: Explicitly type 'assessment' here to resolve the error
      (assessment: Assessment) =>
        (assessment.title || '').toLowerCase().includes(term) ||
        (assessment.description || '').toLowerCase().includes(term)
    )
  }, [search, assessments])

  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
  }

  const handleUpdateAssessment = async (updatedAssessment: Assessment) => {
    try {
      await updateMutation.mutateAsync({ 
        id: updatedAssessment.id, 
        data: updatedAssessment 
      })
      setSelectedAssessment(updatedAssessment)
      toast.success("Assessment saved successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save assessment")
    }
  }

  const handleNewAssessment = async () => {
    const newDraft: Partial<Assessment> = {
        title: 'New Untitled Assessment',
        description: 'Edit the details and add questions.',
        purpose: 'Quiz' as AssessmentPurpose,
        questions: [],
        // Backend handles ID and timestamps creation
    }
    
    try {
      const created = await createMutation.mutateAsync(newDraft)
      setSelectedAssessment(created)
      toast.success("New assessment created")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create assessment")
    }
  }

  return {
    search,
    setSearch,
    assessments: filteredAssessments,
    allAssessments: assessments,
    selectedAssessment,
    handleSelectAssessment,
    handleUpdateAssessment,
    handleNewAssessment,
    isLoading,
    isError
  }
}