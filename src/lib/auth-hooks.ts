// src/lib/auth-hooks.ts
import { sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'sonner'
import api from '@/lib/axios-client'
import { auth } from '@/lib/firebase-config'
import { useAuthStore } from '@/stores/auth-store'

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

// Login
export async function login(payload: { email: string; password: string }) {
  const res = await api.post('/auth/login', payload)
  return res.data
}

// Refresh
export async function refresh() {
  const res = await api.post('/auth/refresh', {})
  return res.data
}

// Logout
export async function logout() {
  try {
    // Attempt backend logout (clears cookies)
    await api.post('/auth/logout', {})
  } catch (error) {
    console.warn("Backend logout failed, forcing local logout", error)
  } finally {
    // [FIX] Always clear local state, regardless of backend response
    // This ensures the user is redirected to login even if the API errors out
    useAuthStore.getState().auth.reset()
    
    // Optional: Hard reload to clear any lingering React Query cache or states
    window.location.href = '/sign-in'
  }
}

// Password reset via Firebase (client-side email trigger)
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

// [FIX] Update User Password (Authenticated)
// Uses LoginSchema (email + password) structure to match backend
export async function updateUserPassword(email: string, password: string) {
  const res = await api.put('/auth/password', { email, password })
  return res.data
}