// src/lib/axios-client.ts
import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { setCookie } from './cookies'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach bearer token if we have one
api.interceptors.request.use(
  (config) => {
    const token = accessToken || useAuthStore.getState().auth.accessToken
    if (token) {
      config.headers = config.headers ?? {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Attempt token refresh on 401s (except for login/refresh requests)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url || '').includes('/auth/refresh') &&
      !String(originalRequest.url || '').includes('/auth/login')
    ) {
      originalRequest._retry = true

      try {
        const { refreshToken } = useAuthStore.getState().auth
        const body = refreshToken ? { refresh_token: refreshToken } : {}

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          body,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        )

        const newAccessToken = (refreshResponse.data as any)?.token
        const newRefreshToken = (refreshResponse.data as any)?.refresh_token

        if (newAccessToken) {
          // Update store and local token
          useAuthStore.getState().auth.setAccessToken(newAccessToken)

          if (newRefreshToken) {
            useAuthStore.setState((state) => ({
              auth: { ...state.auth, refreshToken: newRefreshToken },
            }))
            setCookie('refresh_token', JSON.stringify(newRefreshToken))
          }

          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        }
      } catch (refreshErr) {
        try {
          useAuthStore.getState().auth.reset()
        } catch {}
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default api
