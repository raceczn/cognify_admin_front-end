import api from '@/lib/axios-client'
import { type Module } from '@/pages/modules/data/schema'

export async function getModules(subjectId?: string) {
  const params = subjectId ? { subject_id: subjectId } : {}
  const res = await api.get('/modules/', { params })
  
  const rawItems = Array.isArray(res.data) ? res.data : res.data.items || []
  return { items: rawItems.map(normalizeModule) }
}

export async function getModule(id: string) {
  const res = await api.get(`/modules/${id}`)
  return normalizeModule(res.data)
}

export async function createModule(data: Partial<Module>) {
  const res = await api.post('/modules/', data)
  return normalizeModule(res.data)
}

export async function updateModule(id: string, data: Partial<Module>) {
  const res = await api.put(`/modules/${id}`, data)
  return normalizeModule(res.data)
}

export async function deleteModule(id: string) {
  const res = await api.delete(`/modules/${id}`)
  return res.data
}

export async function uploadModuleFile(file: File, subjectId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (subjectId) formData.append('subject_id', subjectId)

  const res = await api.post('/modules/upload-smart', formData, {
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

export async function triggerAiGeneration(moduleId: string, type: 'summary' | 'quiz' | 'flashcards') {
  const res = await api.post(`/modules/${moduleId}/generate/${type}`)
  return res.data
}

// Helper
function normalizeModule(record: any): Module {
  const data = record.data || record
  const id = record.id || data.id
  
  // 1. Get raw array or single string from backend
  const rawLevels = Array.isArray(data.bloom_levels) 
    ? data.bloom_levels 
    : (data.bloom_level ? [data.bloom_level] : [])

  // 2. [FIX] Force Title Case (e.g., "remembering" -> "Remembering")
  // This matches the UI constants in your Edit Form
  const bloomLevels = rawLevels.map((l: string) => {
    if (!l) return 'Remembering'
    return l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()
  })

  // 3. Fallback if empty
  if (bloomLevels.length === 0) {
    bloomLevels.push('Remembering')
  }

    return {
    id: id,
    subject_id: data.subject_id || '',
    title: data.title || 'Untitled',
    purpose: data.purpose,
    
    // Ensure strict type compliance
    bloom_levels: bloomLevels,
    bloom_level: bloomLevels[0], 
    
    material_url: data.material_url,
    // cover_image_url removed to match Module type
    

    is_verified: !!data.is_verified,
    verified_at: data.verified_at ? new Date(data.verified_at) : null,
    created_by: data.created_by,
    
    created_at: new Date(data.created_at || new Date()),
    deleted: !!data.deleted,
  }
}
