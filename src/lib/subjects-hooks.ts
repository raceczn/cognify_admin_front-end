import { type Subject } from '@/pages/subjects/data/schema'
import api from '@/lib/axios-client'

type PaginatedSubjectsResponse = {
  items: Subject[]
  last_doc_id: string | null
}

export async function getAllSubjects(): Promise<PaginatedSubjectsResponse> {
  try {
    const res = await api.get('/subjects/')
    const raw = res.data
    
    // [FIX] Added check for 'raw.subjects' which is what Python backend returns
    const items: Subject[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.subjects) 
          ? raw.subjects 
          : []
          
    return { items, last_doc_id: null }
  } catch (err) {
    console.error('Error fetching subjects:', err)
    return { items: [], last_doc_id: null }
  }
}

// ... rest of the file (createSubject, etc.) remains the same ...
// Ensure you keep the CRUD functions I added in previous turns!
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

export async function uploadSubjectImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/subjects/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function createSubjectFromTos(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/tos/upload-tos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}