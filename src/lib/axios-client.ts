// src/lib/axios-client.ts
import { useAuthStore } from '@/stores/auth-store'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Token is now in HTTP-only cookie, no need to add manually
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401s and Permissions
api.interceptors.response.use(
  async (response) => {
    const url = String(response.config?.url || '')

    // Check permission after login or refresh
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      try {
        const permissionResponse = await axios.post(
          `${API_BASE_URL}/auth/permission`,
          {
            designation: ["admin", "faculty_member"]
          },
          {
            withCredentials: true,
          }
        )

        const data = (permissionResponse.data as any) || {}

        // Handle Permission Logic
        if (typeof data.has_permission === 'boolean') {
          if (!data.has_permission) {
            console.warn('User does not have required permissions.')
            throw new Error('Access Denied: You do not have permission to access this system.')
          }
          // [FIX] REMOVED window.location.href = '/'
          // We simply return the response and let the calling component (UserAuthForm) handle navigation.
        } 
        
        if (data.role_designation) {
          useAuthStore.setState((state) => ({
            auth: { ...state.auth, roleDesignation: data.role_designation },
          }))
        }
      } catch (err) {
        // If permission check fails, reject the promise so UserAuthForm catches it
        return Promise.reject(err)
      }
    }

    return response
  },
  async (error) => {
    // Handle 401 Unauthorized (Token Expiry)
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      
      try {
        await api.post('/auth/refresh') // Backend reads refresh cookie
        return api(error.config) // Retry original request
      } catch (refreshError) {
        // Only redirect to login if refresh fails and we are not already there
        if (window.location.pathname !== '/sign-in') {
             window.location.href = '/sign-in'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api