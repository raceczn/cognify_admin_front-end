import axios, { AxiosError } from "axios";

// --- API base URL (adjust if needed) ---
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "https://cognify-backend.vercel.app");

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // crucial for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Access token in memory ---
let accessToken: string | null = null;

// --- Set token (you can export this setter to call after login) ---
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

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
        // Request new token using refresh cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = (refreshResponse.data as any)?.token;
        if (newToken) {
          setAccessToken(newToken);
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn("Refresh token expired or invalid. Redirect to login.");
        // Optional: handle logout or redirect here
        setAccessToken(null);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
