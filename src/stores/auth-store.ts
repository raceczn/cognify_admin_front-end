// src/stores/auth-store.ts
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

interface Profile {
  role: any
  id: string
  first_name?: string
  middle_name?: string | null
  last_name?: string
  nickname?: string
  user_name?: string
  role_id: string
  email: string
  // [FIX] Added profile_picture to the interface
  profile_picture?: string | null 
  profile_image?: string | null // Keep for backward compatibility
  
  pre_assessment_score?: number
  ai_confidence?: number
  current_module?: string
  created_at: string
  updated_at?: string
  deleted: boolean
  deleted_at?: string | null
}

interface AuthUser {
  uid: string
  email: string
  role_id: string
  profile: Profile
  roleDesignation?: string 
}

type AuthSlice = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  reset: () => void
}

export interface AuthState {
  auth: AuthSlice
}

const USER_INFO_KEY = 'user_info'

const readJsonCookie = <T = any>(key: string): T | null => {
  const raw = getCookie(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initUser = readJsonCookie<AuthUser>(USER_INFO_KEY)

  const initial: AuthSlice = {
    user: initUser || null,
    
    setUser: (user) =>
      set((state) => {
        if (user === null) {
          removeCookie(USER_INFO_KEY)
          return { ...state, auth: { ...state.auth, user: null } }
        }
        setCookie(USER_INFO_KEY, JSON.stringify(user))
        return { ...state, auth: { ...state.auth, user } }
      }),

    reset: () =>
      set((state) => {
        removeCookie(USER_INFO_KEY)
        return {
          ...state,
          auth: {
            ...state.auth,
            user: null,
          },
        }
      }),
  }

  return { auth: initial }
})