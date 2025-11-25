import api from '@/lib/axios-client'
import { type Subject, type SubjectBase } from '@/pages/subjects/data/schema'

/**
 * [All] Lists all non-deleted subjects (paginated).
 */
export async function getAllSubjects(limit = 100, startAfter?: string) {
  try {
    const res = await api.get(`/subjects/`, {
      params: { limit, start_after: startAfter },
    })
    // Log to verify data arrives
    console.log("📦 [Frontend] Subjects API Response:", res.data) 
    return res.data
  } catch (error) {
    console.error("❌ [Frontend] Error fetching subjects:", error)
    throw error
  }
}

export async function getSubject(id: string) {
  const res = await api.get(`/subjects/${id}`)
  return res.data
}

export async function createSubject(subjectData: Subject) {
  // Backend expects 'subject_id' in the body for creation
  const res = await api.post(`/subjects/`, subjectData)
  return res.data
}

export async function updateSubject(id: string, subjectData: SubjectBase) {
  const res = await api.put(`/subjects/${id}`, subjectData)
  return res.data
}