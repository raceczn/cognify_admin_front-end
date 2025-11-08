// src/stores/auth-store.ts
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { setAccessToken as setAxiosAccessToken } from '@/lib/axios-client'

// --- FIX: This interface now matches your backend's UserProfileModel ---
interface Profile {
  id: string // Firebase UID
  first_name?: string
  middle_name?: string
  last_name?: string
  nickname?: string
  role_id: string
  email: string
  pre_assessment_score?: number
  ai_confidence?: number
  current_module?: string
  created_at: string
  updated_at?: string
  deleted: boolean
  deleted_at?: string // Added this to match backend
}

// This is the full user object we'll store
interface AuthUser {
  uid: string
  email: string
  role_id: string
  profile: Profile // <-- FIX: Changed from ProfileModel to Profile
  exp: number
}
// --- END FIX ---

// Renamed cookie constants for clarity
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

export interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    refreshToken: string
    setLoginData: (
      user: AuthUser,
      accessToken: string,
      refreshToken: string
    ) => void
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    reset: () => void
  }
}

// Helper to get initial state from cookies
const getInitialState = () => {
  const tokenCookie = getCookie(ACCESS_TOKEN_KEY)
  const userCookie = getCookie(USER_INFO_KEY)
  const refreshCookie = getCookie(REFRESH_TOKEN_KEY)

  let initToken = ''
  let initUser = null
  let initRefresh = ''

  try {
    initToken = tokenCookie ? JSON.parse(tokenCookie) : ''
    initUser = userCookie ? JSON.parse(userCookie) : null
    initRefresh = refreshCookie ? JSON.parse(refreshCookie) : ''
  } catch (e) {
    console.warn('Failed to parse auth cookies:', e)
    // Clear bad cookies
    removeCookie(ACCESS_TOKEN_KEY)
    removeCookie(USER_INFO_KEY)
    removeCookie(REFRESH_TOKEN_KEY)
  }

  if (initToken) {
    setAxiosAccessToken(initToken) // Sync axios on load
  }

  return {
    user: initUser,
    accessToken: initToken,
    refreshToken: initRefresh,
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    ...getInitialState(),

    setUser: (user) =>
      set((state) => {
        if (user === null) {
          removeCookie(USER_INFO_KEY)
          return { ...state, auth: { ...state.auth, user: null } }
        }

        // Merge with existing user data just in case
        const mergedUser = { ...(state.auth.user || {}), ...user } as AuthUser

        setCookie(USER_INFO_KEY, JSON.stringify(mergedUser))
        return { ...state, auth: { ...state.auth, user: mergedUser } }
      }),

    setAccessToken: (accessToken) =>
      set((state) => {
        setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
        setAxiosAccessToken(accessToken) // Sync with axios client
        return { ...state, auth: { ...state.auth, accessToken } }
      }),

    // --- NEW ATOMIC FUNCTION ---
    // This sets everything in one go, fixing race conditions
    setLoginData: (user, accessToken, refreshToken) =>
      set((state) => {
        // 1. Set User
        setCookie(USER_INFO_KEY, JSON.stringify(user))

        // 2. Set Access Token
        setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
        setAxiosAccessToken(accessToken)

        // 3. Set Refresh Token
        setCookie(REFRESH_TOKEN_KEY, JSON.stringify(refreshToken))

        // 4. Return all at once
        return {
          ...state,
          auth: {
            ...state.auth,
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        }
      }),

    reset: () =>
      set((state) => {
        removeCookie(ACCESS_TOKEN_KEY)
        removeCookie(USER_INFO_KEY)
        removeCookie(REFRESH_TOKEN_KEY)
        setAxiosAccessToken(null)
        return {
          ...state,
          auth: {
            ...state.auth,
            user: null,
            accessToken: '',
            refreshToken: '',
          },
        }
      }),
  },
}))