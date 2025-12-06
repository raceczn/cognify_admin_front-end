import api from '@/lib/axios-client'
import { Module } from '@/pages/modules/data/schema'

export async function getModules() {
  const res = await api.get('/modules/')
  return res.data
}

export async function getModule(id: string) {
  const res = await api.get(`/modules/${id}`)
  return res.data
}

export async function createModule(data: Partial<Module>) {
  const res = await api.post('/modules/', data)
  return res.data
}

export async function updateModule({ id, data }: { id: string; data: Partial<Module> }) {
  const res = await api.put(`/modules/${id}`, data)
  return res.data
}

export async function deleteModule(id: string) {
  const res = await api.delete(`/modules/${id}`)
  return res.data
}

// [NEW] Add this function to handle file uploads
export async function uploadModuleMaterial(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  // This hits your new Backend V2 endpoint
  const res = await api.post('/modules/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data // Returns { file_url: "..." }
}