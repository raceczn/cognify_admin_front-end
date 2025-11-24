// src/hooks/useAssessments.ts
import { useState, useMemo } from 'react'
import { Assessment, mockAssessments } from '@/pages/assessments/data/assessment'

export function useAssessments() {
  const [search, setSearch] = useState('')
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  
  // Memoize filtered list for AssessmentList
  const filteredAssessments = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return assessments
    return assessments.filter(
      (assessment) =>
        assessment.title.toLowerCase().includes(term) ||
        assessment.description.toLowerCase().includes(term)
    )
  }, [search, assessments])

  // Handle assessment selection
  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
  }

  // Handle saving changes to an assessment
  const handleUpdateAssessment = (updatedAssessment: Assessment) => {
    setAssessments(prev => 
        prev.map(a => a.id === updatedAssessment.id ? updatedAssessment : a)
    )
    // Update the selected assessment's reference to the new one
    setSelectedAssessment(updatedAssessment) 
    // In a real app, this would trigger a mutation/API call
    // toast.success(`Assessment "${updatedAssessment.title}" saved successfully!`)
  }

  // Handle creating a new assessment
  const handleNewAssessment = () => {
    const newAssessment: Assessment = {
        id: Math.random().toString(36).substring(2, 9),
        title: 'New Untitled Assessment',
        description: 'Edit the details and add questions.',
        status: 'Draft',
        // --- FIX: Add the missing 'purpose' field ---
        purpose: 'Quiz', // Setting a sensible default purpose for a new assessment
        // ------------------------------------------
        questions: [],
        created_at: new Date().toISOString().substring(0, 10),
        last_modified: new Date().toISOString().substring(0, 10),
    }
    setAssessments(prev => [newAssessment, ...prev])
    setSelectedAssessment(newAssessment)
  }

  // Effect to sync selectedAssessment state on updates to the main list
  // Note: This pattern is usually handled by `handleUpdateAssessment` but 
  // keeping it here helps if updates are made externally to the list.
  // For simplicity with the local state, we rely on the updates in handleUpdateAssessment.

  return {
    search,
    setSearch,
    assessments: filteredAssessments,
    allAssessments: assessments, // Full list for internal use if needed
    selectedAssessment,
    handleSelectAssessment,
    handleUpdateAssessment,
    handleNewAssessment,
  }
}