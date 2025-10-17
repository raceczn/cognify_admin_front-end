import axios, { AxiosError } from "axios";
import { syncAuthFromBackend } from "@/stores/auth-store"

// --- API base URL (adjust if needed) ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// --- Access & Refresh tokens in memory ---
let accessToken: string | null = null;
let refreshToken: string | null = null;

// --- Token setters (export these) ---
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
};

// --- Token getters (optional, useful for debugging or external access) ---
export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // crucial for cookie-based auth
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAccessToken()}`
  },
});

// --- Request interceptor: attach access token ---
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
      !originalRequest.url.includes("/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Request new token using refresh token from memory
        const refreshBody = refreshToken ? { refresh_token: refreshToken } : {};
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/refresh`,
          refreshBody,
          { withCredentials: true }
        );

        const newAccessToken = (refreshResponse.data as any)?.token;
        const newRefreshToken = (refreshResponse.data as any)?.refresh_token;

        if (newAccessToken) {
          setAccessToken(newAccessToken)
          if (newRefreshToken) setRefreshToken(newRefreshToken)
          
          // Sync Zustand
          syncAuthFromBackend({
            token: newAccessToken,
            refresh_token: newRefreshToken,
          })

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.warn("Refresh token expired or invalid. Redirect to login.");
        // Clear tokens on refresh failure
        setAccessToken(null);
        setRefreshToken(null);
      }
    }

    return Promise.reject(error);
  }
);

export default api;