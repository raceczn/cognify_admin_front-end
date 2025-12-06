import api from '@/lib/axios-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Assessment } from '@/pages/assessments/data/schema'

// ==========================================
// 1. Raw API Functions (Used by Provider)
// ==========================================

export const getAllAssessments = async (subjectId?: string) => {
  const params = subjectId ? { subject_id: subjectId } : {}
  const res = await api.get('/assessments/', { params })
  return res.data as Assessment[]
}

export const getAssessment = async (id: string) => {
  const res = await api.get(`/assessments/${id}`)
  return res.data as Assessment
}

export const createAssessment = async (data: Partial<Assessment>) => {
  const res = await api.post('/assessments/', data)
  return res.data
}

export const updateAssessment = async (id: string, data: Partial<Assessment>) => {
  const res = await api.put(`/assessments/${id}`, data)
  return res.data
}

export const deleteAssessment = async (id: string) => {
  await api.delete(`/assessments/${id}`)
}

export const verifyAssessment = async (id: string) => {
  const res = await api.post(`/assessments/${id}/verify`)
  return res.data
}

// ==========================================
// 2. React Query Hooks (Used by Pages)
// ==========================================

export function useAssessmentsQuery(subjectId?: string) {
  return useQuery({
    queryKey: ['assessments', subjectId],
    queryFn: () => getAllAssessments(subjectId),
  })
}

export function useAssessmentQuery(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getAssessment(assessmentId),
    enabled: !!assessmentId,
  })
}

export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

export function useUpdateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assessment> }) => 
      updateAssessment(id, data),
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.id] })
    },
  })
}

export function useDeleteAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

export function useVerifyAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: verifyAssessment,
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      // Invalidating specific assessment too in case we are on the detail page
      queryClient.invalidateQueries({ queryKey: ['assessment', variables] }) 
    },
  })
}