// src/stores/auth-store.ts
import { create } from 'zustand'
import { setAccessToken as setAxiosAccessToken } from '@/lib/axios-client'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

interface Profile {
  id: string
  first_name?: string
  middle_name?: string | null
  last_name?: string
  nickname?: string
  user_name?: string
  role_id: string
  email: string
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
  exp: number
}

type AuthSlice = {
  user: AuthUser | null
  accessToken: string
  refreshToken: string
  setUser: (user: AuthUser | null) => void
  setAccessToken: (accessToken: string) => void
  setLoginData: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string
  ) => void
  reset: () => void
}

export interface AuthState {
  auth: AuthSlice
}

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
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
  const initToken = readJsonCookie<string>(ACCESS_TOKEN_KEY) || ''
  const initUser = readJsonCookie<AuthUser>(USER_INFO_KEY)
  const initRefresh = readJsonCookie<string>(REFRESH_TOKEN_KEY) || ''

  if (initToken) {
    setAxiosAccessToken(initToken)
  }

  const initial: AuthSlice = {
    user: initUser || null,
    accessToken: initToken,
    refreshToken: initRefresh,
    setUser: (user) =>
      set((state) => {
        if (user === null) {
          removeCookie(USER_INFO_KEY)
          return { ...state, auth: { ...state.auth, user: null } }
        }
        setCookie(USER_INFO_KEY, JSON.stringify(user))
        return { ...state, auth: { ...state.auth, user } }
      }),
    setAccessToken: (accessToken) =>
      set((state) => {
        setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
        setAxiosAccessToken(accessToken)
        return { ...state, auth: { ...state.auth, accessToken } }
      }),
    setLoginData: (user, accessToken, refreshToken) =>
      set((state) => {
        setCookie(USER_INFO_KEY, JSON.stringify(user))
        setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
        setCookie(REFRESH_TOKEN_KEY, JSON.stringify(refreshToken))
        setAxiosAccessToken(accessToken)
        return {
          ...state,
          auth: { ...state.auth, user, accessToken, refreshToken },
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
  }

  return { auth: initial }
})
