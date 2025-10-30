// src/lib/auth-hooks.ts
import api, { setAccessToken } from '@/lib/axios-client'
import { auth } from '@/lib/firebase-config'
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'sonner' // Import toast

// =============== AUTH =================

// Login (sets HTTP-only cookie for refresh token + returns idToken)
export async function login(data: { email: string; password: string }) {
  // This just calls the API and returns the data.
  // No state logic here! The form component handles it.
  const res = await api.post('/auth/login', data, { withCredentials: true })
  return res.data 
}

// Refresh (cookie is auto-sent, backend returns new tokens)
export async function refresh() {
  // This is called by the axios interceptor, which handles state.
  const res = await api.post('/auth/refresh', {}, { withCredentials: true })
  return res.data
}

// Logout (clears HTTP-only cookie + in-memory token)
export async function logout() {
  // We only clear the local 'accessToken' variable.
  // The UI (SignOutDialog) is responsible for clearing the store.
  await api.post('/auth/logout', {}, { withCredentials: true })
  setAccessToken(null)
}

// --- REMOVE THE OLD 'profile' FUNCTION ---
// We will use the dedicated profile-hooks.ts file instead.

export async function requestPasswordReset(email: string) {
  try {
    // This uses the *client-side* Firebase SDK
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent! Check your inbox.");
  } catch (error: any) {
    console.error("Password reset error:", error.code);
    if (error.code === "auth/user-not-found") {
      toast.error("No account found with that email.");
    } else {
      toast.error("Failed to send reset email. Please try again.");
    }
  }
}