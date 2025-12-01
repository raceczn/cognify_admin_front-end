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
        } 
        
        if (data.role_designation) {
          useAuthStore.setState((state) => ({
            auth: { ...state.auth, roleDesignation: data.role_designation },
          }))
        }
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized (Token Expiry)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // CRITICAL FIX: Prevent infinite loop
      // Don't retry if the failed request is already the refresh endpoint or login endpoint
      if (
        originalRequest.url?.includes('/auth/refresh') || 
        originalRequest.url?.includes('/auth/login')
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      
      try {
        await api.post('/auth/refresh') // Backend reads refresh cookie
        return api(originalRequest) // Retry original request
      } catch (refreshError) {
        // Refresh failed (Session expired or invalid)
  

        // 2. Redirect to Login if not already there
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