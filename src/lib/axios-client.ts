// src/lib/axios-client.ts
import axios, { AxiosError } from "axios";
// --- FIX: Import the store AND the cookie setter ---
import { useAuthStore } from "@/stores/auth-store";
import { setCookie } from "./cookies";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const REFRESH_TOKEN_KEY = 'refresh_token'; // Key for the cookie

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

export const getRefreshToken = () => useAuthStore.getState().auth.refreshToken;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    let token = accessToken;
    if (!token) {
      token = useAuthStore.getState().auth.accessToken;
      if (token) setAccessToken(token);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState().auth;
        const refreshBody = refreshToken ? { refresh_token: refreshToken } : {};
        
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          refreshBody,
          { withCredentials: true }
        );

        const newAccessToken = (refreshResponse.data as any)?.token;
        const newRefreshToken = (refreshResponse.data as any)?.refresh_token;

        if (newAccessToken) {
          // --- FIX: Call the correct store actions ---
          const { auth } = useAuthStore.getState();
          auth.setAccessToken(newAccessToken); // This updates the store & local var

          if (newRefreshToken) {
             // We must update the store AND the cookie
             useAuthStore.setState((state) => ({
               auth: { ...state.auth, refreshToken: newRefreshToken },
             }));
             setCookie(REFRESH_TOKEN_KEY, JSON.stringify(newRefreshToken));
          }
          // --- End Fix ---

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn("Refresh token expired or invalid. Logging out.");
        useAuthStore.getState().auth.reset();
      }
    }

    return Promise.reject(error);
  }
);

export default api;