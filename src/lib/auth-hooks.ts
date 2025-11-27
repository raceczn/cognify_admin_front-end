// src/lib/auth-hooks.ts
import { sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'sonner'
import api, { setAccessToken } from '@/lib/axios-client'
import { auth } from '@/lib/firebase-config'

// =============== AUTH =================

// Sign Up
export async function signup(payload: {
  email: string
  password: string
  first_name?: string
  last_name?: string
}) {
  const res = await api.post('/auth/signup', payload)
  return res.data
}

// Login (backend sets refresh cookie; returns access token and uid)
export async function login(payload: { email: string; password: string }) {
  const res = await api.post('/auth/login', payload, { withCredentials: true })
  return res.data
}

// Refresh (backend reads refresh cookie; returns new access token)
export async function refresh() {
  const res = await api.post('/auth/refresh', {}, { withCredentials: true })
  return res.data
}

// Logout (clears server-side refresh cookie; clear local access token)
export async function logout() {
  await api.post('/auth/logout', {}, { withCredentials: true })
  setAccessToken(null)
}

// Password reset via Firebase (client-side)
export async function requestPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    toast.success('Password reset email sent! Check your inbox.')
  } catch (error: any) {
    const message = error?.message || 'Failed to send reset email'
    toast.error(message)
    throw error
  }
}
