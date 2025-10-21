// src/stores/auth-store.ts
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { setAccessToken as setAxiosAccessToken } from '@/lib/axios-client'

// This function is still problematic, recommend not using it.
export const syncAuthFromBackend = (data: any) => {
  const { auth } = useAuthStore.getState()
  if (!data) return

  if (data.token) auth.setAccessToken(data.token)
  if (data.refresh_token) auth.setRefreshToken(data.refresh_token)

  const newUser = {
    uid: data.uid ?? auth.user?.uid ?? data.profile?.user_id,
    email: data.email ?? auth.user?.email,
    profile: data.profile ?? auth.user?.profile,
  }

  auth.setUser(newUser)
}

const ACCESS_TOKEN = 'access_token'
const USER_INFO = 'user_info'
const REFRESH_TOKEN = 'refresh_token' // 👈 --- ADD THIS

interface Profile {
  user_id?: string
  last_name?: string
  middle_name?: string
  first_name?: string
  nickname?: string
  role_id?: string
  updated_at?: string
  deleted?: boolean
}

interface AuthUser {
  uid?: string
  email: string
  profile?: Profile
  role_id?: string
  exp?: number
}

export interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: Partial<AuthUser> | null) => void // 👈 Allow partial updates
    accessToken: string
    setAccessToken: (accessToken: string) => void
    refreshToken: string // 👈 --- ADD THIS
    setRefreshToken: (refreshToken: string) => void // 👈 --- ADD THIS
    setLoginData: (user: Partial<AuthUser>, accessToken: string, refreshToken: string) => void // 👈 --- ADD THIS
    reset: () => void
    resetAccessToken: () => void
  }
}

const getInitialState = () => {
  const tokenCookie = getCookie(ACCESS_TOKEN)
  const userCookie = getCookie(USER_INFO)
  const refreshCookie = getCookie(REFRESH_TOKEN) // 👈 --- ADD THIS

  const initToken = tokenCookie ? JSON.parse(tokenCookie) : ''
  const initUser = userCookie ? JSON.parse(userCookie) : null
  const initRefresh = refreshCookie ? JSON.parse(refreshCookie) : '' // 👈 --- ADD THIS

  return {
    user: initUser,
    accessToken: initToken,
    refreshToken: initRefresh, // 👈 --- ADD THIS
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    ...getInitialState(),

    setUser: (user) =>
      set((state) => {
        if (user === null) {
          removeCookie(USER_INFO)
          return { ...state, auth: { ...state.auth, user: null } }
        }

        // This is the merge logic you were trying to do in your screenshot
        const mergedUser = { ...state.auth.user, ...user } as AuthUser

        // This correctly finds the UID from either the top level OR the profile
        const cleanUser: AuthUser = {
          email: mergedUser.email,
          uid: mergedUser.uid ?? mergedUser.profile?.user_id, // 👈 --- CORRECTED
          profile: mergedUser.profile || {},
          role_id: mergedUser.role_id ?? mergedUser.profile?.role_id,
          exp: mergedUser.exp,
        }
        
        // Remove undefined keys
        Object.keys(cleanUser).forEach(key => {
          if (cleanUser[key as keyof AuthUser] === undefined) {
            delete cleanUser[key as keyof AuthUser];
          }
        });

        setCookie(USER_INFO, JSON.stringify(cleanUser))
        return { ...state, auth: { ...state.auth, user: cleanUser } }
      }),

    setAccessToken: (accessToken) =>
      set((state) => {
        setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
        setAxiosAccessToken(accessToken) // Sync with axios client
        return { ...state, auth: { ...state.auth, accessToken } }
      }),
      
    // ---------------------------------
    // 👇 --- ADD THESE NEW FUNCTIONS --- 👇
    // ---------------------------------

    setRefreshToken: (refreshToken) =>
      set((state) => {
        setCookie(REFRESH_TOKEN, JSON.stringify(refreshToken))
        return { ...state, auth: { ...state.auth, refreshToken } }
      }),

    setLoginData: (user, accessToken, refreshToken) =>
      set((state) => {
        // 1. Set User
        const mergedUser = { ...state.auth.user, ...user } as AuthUser
        const cleanUser: AuthUser = {
          email: mergedUser.email,
          uid: mergedUser.uid ?? mergedUser.profile?.user_id,
          profile: mergedUser.profile || {},
          role_id: mergedUser.role_id ?? mergedUser.profile?.role_id,
          exp: mergedUser.exp,
        }
        Object.keys(cleanUser).forEach(key => {
          if (cleanUser[key as keyof AuthUser] === undefined) {
            delete cleanUser[key as keyof AuthUser];
          }
        });
        setCookie(USER_INFO, JSON.stringify(cleanUser))

        // 2. Set Access Token
        setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
        setAxiosAccessToken(accessToken)

        // 3. Set Refresh Token
        setCookie(REFRESH_TOKEN, JSON.stringify(refreshToken))

        // 4. Return all at once
        return {
          ...state,
          auth: {
            ...state.auth,
            user: cleanUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        }
      }),

    resetAccessToken: () =>
      set((state) => {
        removeCookie(ACCESS_TOKEN)
        setAxiosAccessToken(null)
        return { ...state, auth: { ...state.auth, accessToken: '' } }
      }),

    reset: () =>
      set((state) => {
        removeCookie(ACCESS_TOKEN)
        removeCookie(USER_INFO)
        removeCookie(REFRESH_TOKEN) // 👈 --- ADD THIS
        setAxiosAccessToken(null)
        return {
          ...state,
          auth: {
            ...state.auth,
            user: null,
            accessToken: '',
            refreshToken: '', // 👈 --- ADD THIS
          },
        }
      }),
  },
}))