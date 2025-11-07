// src/lib/content-hooks.ts
import api from '@/lib/axios-client'

// ========== Modules ==========

/**
 * [All] Lists all non-deleted learning modules (paginated).
 */
export async function getModules(limit = 20, startAfter?: string) {
  const res = await api.get(`/modules/`, {
    params: { limit, start_after: startAfter },
  })
  return res.data
}

/**
 * [All] Gets a single module by ID.
 */
export async function getModule(id: string) {
  const res = await api.get(`/modules/${id}`)
  return res.data
}

/**
 * [Admin/Faculty] Uploads a module file (PDF, etc.) and returns a URL.
 */
export async function uploadModuleFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post(`/modules/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data as { file_url: string }
}

/**
 * [Admin/Faculty] Creates a new module.
 */
export async function createModule(moduleData: any) {
  const res = await api.post(`/modules/`, moduleData)
  return res.data
}

/**
 * [Admin/Faculty] Updates an existing module.
 */
export async function updateModule(id: string, moduleData: any) {
  const res = await api.put(`/modules/${id}`, moduleData)
  return res.data
}

/**
 * [Admin/Faculty] Soft-deletes a module.
 */
export async function deleteModule(id: string) {
  const res = await api.delete(`/modules/${id}`)
  return res.data // Backend should return 204, but we handle any
}

// ========== AI Generated Content ==========

/**
 * [Admin/Faculty] Triggers AI content generation for a module.
 */
export async function triggerAiGeneration(moduleId: string) {
  const res = await api.post(`/generate/from_module/${moduleId}`)
  return res.data
}

/**
 * [All] Gets AI-generated summaries for a module (paginated).
 */
export async function getGeneratedSummaries(
  moduleId: string,
  limit = 10,
  startAfter?: string
) {
  const res = await api.get(
    `/generate/generated_summaries/for_module/${moduleId}`,
    {
      params: { limit, start_after: startAfter },
    }
  )
  return res.data
}

/**
 * [All] Gets AI-generated quizzes for a module (paginated).
 */
export async function getGeneratedQuizzes(
  moduleId: string,
  limit = 10,
  startAfter?: string
) {
  const res = await api.get(
    `/generate/generated_quizzes/for_module/${moduleId}`,
    {
      params: { limit, start_after: startAfter },
    }
  )
  return res.data
}

/**
 * [All] Gets AI-generated flashcards for a module (paginated).
 */
export async function getGeneratedFlashcards(
  moduleId: string,
  limit = 10,
  startAfter?: string
) {
  const res = await api.get(
    `/generate/generated_flashcards/for_module/${moduleId}`,
    {
      params: { limit, start_after: startAfter },
    }
  )
  return res.data
}

// ========== Subjects & TOS ==========

/**
 * [Admin/Faculty] Gets all subjects (paginated, but we'll fetch all)
 * NOTE: A real app would paginate this, but for a dropdown, fetching 100 is fine.
 */
export async function getAllSubjects() {
  const res = await api.get(`/subjects/`, { params: { limit: 100 } })
  // Assuming the subject list is needed for dropdowns, we just return items
  return (res.data.items || []) as { subject_id: string; subject_name: string }[]
}

/**
 * [Admin/Faculty] Gets a subject by ID.
 */
export async function getSubject(subjectId: string) {
  const res = await api.get(`/subjects/${subjectId}`)
  return res.data
}

/**
 * [All] Lists all TOS versions for a subject (paginated).
 */
export async function getTosForSubject(
  subjectId: string,
  limit = 20,
  startAfter?: string
) {
  const res = await api.get(`/tos/by_subject/${subjectId}`, {
    params: { limit, start_after: startAfter },
  })
  return res.data
}

/**
 * [All] Gets a TOS document by ID.
 */
export async function getTos(id: string) {
  const res = await api.get(`/tos/${id}`)
  return res.data
}

/**
 * [Admin/Faculty] Activates a TOS version for a subject.
 */
export async function activateTos(subjectId: string, tosId: string) {
  const res = await api.post(`/subjects/${subjectId}/activate_tos/${tosId}`)
  return res.data
}