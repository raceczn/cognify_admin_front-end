// src/lib/subjects-hooks.ts
import { type Subject } from '@/pages/subjects/data/schema'
import api from '@/lib/axios-client'

type PaginatedSubjectsResponse = {
  items: Subject[]
  last_doc_id: string | null
}

export async function getAllSubjects(): Promise<PaginatedSubjectsResponse> {
  try {
    const res = await api.get('/subjects/')

    const rawItems = Array.isArray(res.data) ? res.data : res.data?.items || []

    const items: Subject[] = rawItems.map((s: any) => {
      const data = s.data || s
      return {
        id: s.id || data.id || '',
        title: data.title || 'Untitled',
        pqf_level: data.pqf_level ?? 6,
        description: data.description,
        icon_name: data.icon_name ?? 'book',
        icon_color: data.icon_color ?? '#000000',
        icon_bg_color: data.icon_bg_color ?? '#ffffff',
        card_bg_color: data.card_bg_color ?? '#ffffff',
        is_verified: !!data.is_verified,
        created_at: data.created_at ? new Date(data.created_at) : undefined,
      }
    })

    return { items, last_doc_id: res.data?.last_doc_id ?? null }
  } catch (err) {
    console.error('Error fetching subjects:', err)
    return { items: [], last_doc_id: null }
  }
}

// [FIX] Added missing CRUD operations
export async function createSubject(data: Partial<Subject>) {
  const res = await api.post('/subjects/', data)
  return res.data
}

export async function updateSubject(id: string, data: Partial<Subject>) {
  const res = await api.put(`/subjects/${id}`, data)
  return res.data
}

export async function deleteSubject(id: string) {
  const res = await api.delete(`/subjects/${id}`)
  return res.data
}

export async function getSubject(id: string): Promise<Subject> {
  const res = await api.get(`/subjects/${id}`)
  return res.data
}
