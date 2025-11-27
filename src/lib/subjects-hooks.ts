// src/lib/subjects-hooks.ts
import api from '@/lib/axios-client'

export type Subject = { subject_id: string; subject_name: string }

type PaginatedSubjectsResponse = {
  items: Subject[]
  last_doc_id: string | null
}

// There is no explicit subjects listing endpoint in the guide.
// This function gracefully returns an empty list if none is available.
export async function getAllSubjects(): Promise<PaginatedSubjectsResponse> {
  try {
    // Attempt to discover subjects via admin system endpoints if available
    // Replace with the real endpoint once available.
    const res = await api.get('/admin/system/health')
    const subjects = res.data?.subjects ?? []
    const items: Subject[] = (subjects as any[]).map((s) => ({
      subject_id: String(s.subject_id ?? s.id ?? ''),
      subject_name: String(s.subject_name ?? s.name ?? ''),
    }))
    return { items, last_doc_id: null }
  } catch (err) {
    // Fallback: return an empty list to keep UI stable
    return { items: [], last_doc_id: null }
  }
}
