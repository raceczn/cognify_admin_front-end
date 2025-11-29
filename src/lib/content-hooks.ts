// src/lib/content-hooks.ts
import api from '@/lib/axios-client'
import { type Module } from '@/pages/modules/data/schema'

// ... (Keep getModules, createModule, updateModule, deleteModule, uploadModuleFile) ...

export async function getModules(subjectId?: string) {
  const params = subjectId ? { subject_id: subjectId } : {}
  const res = await api.get('/modules/', { params })
  return { items: res.data.map(normalizeModule) }
}

export async function createModule(data: Partial<Module>) {
  const res = await api.post('/modules/', data)
  return res.data
}

export async function updateModule(id: string, data: Partial<Module>) {
  const res = await api.put(`/modules/${id}`, data)
  return res.data
}

export async function deleteModule(id: string) {
  const res = await api.delete(`/modules/${id}`)
  return res.data
}

export async function uploadModuleFile(file: File, subjectId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (subjectId) formData.append('subject_id', subjectId)

  const res = await api.post('/modules/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data 
}

export async function verifyModule(id: string) {
  const res = await api.post(`/modules/${id}/verify`)
  return res.data
}

export async function rejectModule(id: string, reason: string) {
  const res = await api.post(`/modules/${id}/reject`, null, {
    params: { reason }
  })
  return res.data
}

// [FIX] Added missing AI Trigger function
export async function triggerAiGeneration(moduleId: string, type: 'summary' | 'quiz' | 'flashcards') {
  const res = await api.post(`/modules/${moduleId}/generate/${type}`)
  return res.data
}

// Helper
function normalizeModule(record: any): Module {
  const data = record.data || record
  const id = record.id || data.id
  
  return {
    id: id,
    subject_id: data.subject_id || '',
    title: data.title || 'Untitled',
    purpose: data.purpose,
    bloom_level: data.bloom_level,
    material_type: data.material_type,
    material_url: data.material_url,
    
    is_verified: !!data.is_verified,
    verified_at: data.verified_at ? new Date(data.verified_at) : null,
    created_by: data.created_by,

    generated_summary_id: data.generated_summary_id,
    generated_quiz_id: data.generated_quiz_id,
    generated_flashcards_id: data.generated_flashcards_id,
    created_at: new Date(data.created_at || new Date()),
    deleted: !!data.deleted,
    deleted_at: data.deleted_at ? new Date(data.deleted_at) : null
  }
}