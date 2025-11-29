// src/lib/subjects-hooks.ts
import api from '@/lib/axios-client'
import { type Subject } from '@/pages/subjects/data/schema'

type PaginatedSubjectsResponse = {
  items: Subject[]
  last_doc_id: string | null
}

export async function getAllSubjects(): Promise<PaginatedSubjectsResponse> {
  try {
    // Attempt to fetch from a dedicated subjects endpoint first
    // If you haven't created GET /subjects yet, use the admin queue as fallback or return empty
    // Ideally: const res = await api.get('/subjects')
    
    // For now, using a fallback or admin endpoint if your backend setup isn't fully ready for /subjects
    const res = await api.get('/admin/verification-queue') 
    
    // Normalize data to match the Subject Schema
    const rawItems = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    
    // Filter only subjects from the queue or list
    const subjectItems = rawItems.filter((i: any) => i.type === 'subject' || !i.type)

    const items: Subject[] = subjectItems.map((s: any) => {
        const data = s.data || s
        return {
            id: s.id || s.item_id || '',
            title: data.title || s.title || 'Untitled',
            pqf_level: data.pqf_level ?? 6,
            description: data.description,
            // Defaults for UI fields
            icon_name: 'book',
            icon_color: '#000000',
            icon_bg_color: '#ffffff',
            card_bg_color: '#ffffff',
            is_verified: !!data.is_verified,
            created_at: data.created_at ? new Date(data.created_at) : undefined
        }
    })
    
    return { items, last_doc_id: null }
  } catch (err) {
    console.error("Error fetching subjects:", err)
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