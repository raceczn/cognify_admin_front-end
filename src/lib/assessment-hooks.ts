import api from '@/lib/axios-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Assessment } from '@/pages/assessments/data/schema'

export function useAssessmentsQuery(subjectId?: string) {
  return useQuery({
    queryKey: ['assessments', subjectId],
    queryFn: async () => {
      const params = subjectId ? { subject_id: subjectId } : {}
      const res = await api.get('/assessments/', { params })
      return res.data as Assessment[]
    },
  })
}

export function useAssessmentQuery(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const res = await api.get(`/assessments/${assessmentId}`)
      return res.data as Assessment
    },
    enabled: !!assessmentId,
  })
}

export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Assessment>) => {
      const res = await api.post('/assessments/', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

export function useUpdateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Assessment> }) => {
      const res = await api.put(`/assessments/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

export function useVerifyAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/assessments/${id}/verify`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

// [FIX] Added missing export
export function useDeleteAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assessments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}
