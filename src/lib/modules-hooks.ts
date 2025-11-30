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