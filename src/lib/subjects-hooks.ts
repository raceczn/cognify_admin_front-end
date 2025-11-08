// src/lib/subjects-hooks.ts
import api from '@/lib/axios-client'
import { type Subject, type SubjectBase } from '@/pages/subjects/data/schema'

/**
 * [All] Lists all non-deleted subjects (paginated).
 * NOTE: We'll fetch up to 100 for dropdowns, but this supports pagination.
 */
export async function getAllSubjects(limit = 100, startAfter?: string) {
  const res = await api.get(`/subjects/`, {
    params: { limit, start_after: startAfter },
  })
  return res.data
}

/**
 * [All] Gets a single subject by ID.
 */
export async function getSubject(id: string) {
  const res = await api.get(`/subjects/${id}`)
  return res.data
}

/**
 * [Admin/Faculty] Creates a new subject.
 * Note: The backend requires the 'subject_id' in the payload for creation.
 */
export async function createSubject(subjectData: Subject) {
  const res = await api.post(`/subjects/`, subjectData)
  return res.data
}

/**
 * [Admin/Faculty] Updates an existing subject.
 * The payload (SubjectBase) does not include the subject_id.
 */
export async function updateSubject(id: string, subjectData: SubjectBase) {
  const res = await api.put(`/subjects/${id}`, subjectData)
  return res.data
}

// NOTE: A 'deleteSubject' function is intentionally omitted
// as the 'DELETE /subjects/{id}' endpoint does not exist on the backend.