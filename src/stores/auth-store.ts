import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

export const syncAuthFromBackend = (data: any) => {
  const { auth } = useAuthStore.getState()
  if (!data) return

  if (data.token) auth.setAccessToken(data.token)

  const newUser = {
    uid: data.uid ?? auth.user?.uid,
    email: data.email ?? auth.user?.email,
    profile: data.profile ?? auth.user?.profile,
  }

  auth.setUser(newUser)
}

const ACCESS_TOKEN = 'access_token'
const USER_INFO = 'user_info'

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
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const tokenCookie = getCookie(ACCESS_TOKEN)
  const userCookie = getCookie(USER_INFO)

  const initToken = tokenCookie ? JSON.parse(tokenCookie) : ''
  const initUser = userCookie ? JSON.parse(userCookie) : null

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            // only store necessary keys
            const cleanUser = {
              uid: user.profile?.user_id,
              email: user.email,
              profile: user.profile || {},
              role_id: user.role_id,
              exp: user.exp,
            }
            setCookie(USER_INFO, JSON.stringify(cleanUser))
            return { ...state, auth: { ...state.auth, user: cleanUser } }
          } else {
            removeCookie(USER_INFO)
            return { ...state, auth: { ...state.auth, user: null } }
          }
        }),

      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),

      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),

      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(USER_INFO)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

