// src/lib/axios-client.ts
import axios, { AxiosError } from "axios";
// ---------------------------------
// MODIFIED:
// Import the store to get/set state, remove syncAuthFromBackend
// ---------------------------------
import { useAuthStore } from "@/stores/auth-store";

// --- API base URL (adjust if needed) ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// --- Access token in memory (Refresh token is now in Zustand) ---
let accessToken: string | null = null;
// ---------------------------------
// MODIFIED: Removed local refreshToken variable
// ---------------------------------

// --- Token setters (export these) ---
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// ---------------------------------
// MODIFIED:
// setRefreshToken now updates the ZUSTAND STORE.
// This is not used by the interceptor, but can be used by other hooks.
// ---------------------------------
export const setRefreshToken = (token: string | null) => {
  if (token) {
    useAuthStore.getState().auth.setRefreshToken(token);
  } else {
    // Handle reset if needed, though store.reset() is better
  }
};

// --- Token getters (optional, useful for debugging or external access) ---
export const getAccessToken = () => accessToken;
// ---------------------------------
// MODIFIED: Get refresh token from the store
// ---------------------------------
export const getRefreshToken = () => useAuthStore.getState().auth.refreshToken;

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAccessToken()}`
  },
});

// --- Request interceptor: attach access token ---
api.interceptors.request.use(
  (config) => {
    // ---------------------------------
    // MODIFIED:
    // Get the access token from the store if the local one is missing.
    // This makes it robust on reload.
    // ---------------------------------
    let token = accessToken;
    if (!token) {
      token = useAuthStore.getState().auth.accessToken;
      if (token) setAccessToken(token); // Sync local variable
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: auto-refresh if 401 ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") && // 👈 Added /auth
      !originalRequest.url.includes("/auth/login")   // 👈 Added /auth
    ) {
      originalRequest._retry = true;

      try {
        // ---------------------------------
        // MODIFIED:
        // Get refresh token from the store
        // ---------------------------------
        const { refreshToken } = useAuthStore.getState().auth;
        
        const refreshBody = refreshToken ? { refresh_token: refreshToken } : {};
        
        // ---------------------------------
        // MODIFIED: Added /auth prefix
        // ---------------------------------
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          refreshBody,
          { withCredentials: true }
        );

        const newAccessToken = (refreshResponse.data as any)?.token;
        const newRefreshToken = (refreshResponse.data as any)?.refresh_token;

        if (newAccessToken) {
          // ---------------------------------
          // MODIFIED:
          // 1. Set tokens in the store (which saves to cookies)
          // 2. Remove the buggy syncAuthFromBackend call
          // ---------------------------------
          useAuthStore.getState().auth.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            useAuthStore.getState().auth.setRefreshToken(newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn("Refresh token expired or invalid. Logging out.");
        // ---------------------------------
        // MODIFIED: Call the store's reset function
        // ---------------------------------
        useAuthStore.getState().auth.reset();
        // This will trigger the global guard to redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;