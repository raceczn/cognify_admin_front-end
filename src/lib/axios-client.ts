// src/lib/axios-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
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

// Helper to sanitize token (remove extra quotes if present)
const sanitizeToken = (token: string) => token.replace(/^"|"$/g, '')

// Attach bearer token if we have one
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = accessToken || useAuthStore.getState().auth.accessToken
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${sanitizeToken(token)}`
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
          originalRequest.headers.Authorization = `Bearer ${sanitizeToken(newAccessToken)}`
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

// Check permission endpoint after auth responses (login/refresh)
api.interceptors.response.use(
  async (response) => {
    try {
      const url = String(response.config?.url || '')

      // Only run permission check after login or refresh responses
      if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
        
        // 1. Extract token from the current response (Login) or Store (Refresh)
        // Note: On login, the store is NOT updated yet, so we must use response.data.token
        let currentToken = (response.data as any)?.token 
        
        if (!currentToken) {
           // Fallback to existing token if not in response body
           currentToken = accessToken || useAuthStore.getState().auth.accessToken
        }

        if (currentToken) {
            // Call permission endpoint without a designation to receive role_designation,
            // or you can pass { designation: 'some_role' } to check specific permission.
            const permissionResponse = await axios.post(
              `${API_BASE_URL}/auth/permission`,
              {
                designation: ["admin", "faculty_member"]
              },
              {
                withCredentials: true,
                headers: { 
                    'Content-Type': 'application/json',
                    // FIX: Manually attach the Authorization header here
                    'Authorization': `Bearer ${sanitizeToken(currentToken)}` 
                },
              }
            )

            const data = (permissionResponse.data as any) || {}

            // If backend returned explicit has_permission boolean, act on it
            if (typeof data.has_permission === 'boolean') {
              if (data.has_permission) {
                // user allowed — redirect to main page
                window.location.href = '/'
              } else {
                throw new Error('Failed to check permissions')
              }
            } else if (data.role_designation) {
              // store role designation in auth store for later use
              useAuthStore.setState((state) => ({
                auth: { ...state.auth, roleDesignation: data.role_designation },
              }))
            }
        }
      }
    } catch (err) {
      // swallow permission-check errors (optional: log)
      console.error('Permission check error:', err)
    }

    return response
  },
  (error) => Promise.reject(error)
)

export default api