// src/lib/admin-hooks.ts
import api from '@/lib/axios-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface VerificationItem {
  item_id: string
  // [FIX] Added 'subject' to the type union
  type: 'module' | 'question' | 'assessment' | 'subject'
  title: string
  submitted_by: string
  submitted_at: string
  details?: string
}

export interface WhitelistedUser {
  id: string
  email: string
  assigned_role: string
  is_registered: boolean
  registered_at?: string
  added_by: string
  created_at: string
}

// --- VERIFICATION QUEUE ---

export function useVerificationQueue() {
  return useQuery({
    queryKey: ['admin-verification-queue'],
    queryFn: async () => {
      const res = await api.get('/admin/verification-queue')
      return res.data as VerificationItem[]
    },
  })
}

export function useVerifyItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      await api.post(`/${type}s/${id}/verify`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification-queue'] })
    },
  })
}

export function useRejectItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, type, reason }: { id: string; type: string; reason: string }) => {
      await api.post(`/${type}s/${id}/reject`, null, { params: { reason } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification-queue'] })
    },
  })
}

// --- WHITELISTING ---

export function useWhitelist() {
  return useQuery({
    queryKey: ['admin-whitelist'],
    queryFn: async () => {
      const res = await api.get('/admin/whitelist')
      const rawUsers = res.data.users || []
      
      return rawUsers.map((item: any) => {
        const data = item.data || item
        return {
          id: item.id || data.id,
          email: data.email,
          assigned_role: data.assigned_role,
          is_registered: !!data.is_registered,
          registered_at: data.registered_at,
          added_by: data.added_by,
          created_at: data.created_at,
        } as WhitelistedUser
      })
    },
  })
}

export function useAddWhitelist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      await api.post('/admin/whitelist-user', null, {
        params: { email, role }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whitelist'] })
    },
  })
}

export function useRemoveWhitelist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      await api.delete(`/admin/whitelist/${email}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whitelist'] })
    },
  })
}

// --- ADD THIS NEW HOOK ---
export function useBulkWhitelist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await api.post('/admin/whitelist/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whitelist'] })
    },
  })
}