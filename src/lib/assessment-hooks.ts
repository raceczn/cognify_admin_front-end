import { Assessment } from '@/pages/assessments/data/assessment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from "@tanstack/react-query";
import api from './axios-client';

// --- Query Keys ---
export const assessmentKeys = {
  all: ['assessments'] as const,
  lists: () => [...assessmentKeys.all, 'list'] as const,
  details: () => [...assessmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assessmentKeys.details(), id] as const,
}

// --- Hooks ---

// 1. Fetch All Assessments
export function useAssessmentsQuery() {
  return useQuery({
    queryKey: assessmentKeys.lists(),
    queryFn: async () => {
      const res = await api.get('/assessments/')
      
      // Handle PaginatedResponse { items: [...], last_doc_id: ... }
      if (res.data && Array.isArray(res.data.items)) {
        return res.data.items as Assessment[]
      }
      
      // Fallback for simple array response
      if (Array.isArray(res.data)) {
        return res.data as Assessment[]
      }
      
      return []
    },
  })
}

// 2. Fetch Single Assessment
export function useAssessmentQuery(id: string) {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: async () => {
      const res = await api.get(`/assessments/${id}`)
      return res.data as Assessment
    },
    enabled: !!id,
  })
}

// 3. Create Assessment
export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Assessment>) => {
      const res = await api.post('/assessments/', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() })
    },
  })
}

// 4. Update Assessment
export function useUpdateAssessmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Assessment> }) => {
      const res = await api.put(`/assessments/${id}`, data)
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() })
    },
  })
}