// src/lib/auth-hooks.ts
import api, { setAccessToken, setRefreshToken } from '@/lib/axios-client'
import { auth } from '@/lib/firebase-config'
import { sendPasswordResetEmail } from 'firebase/auth';

// ---------------------------------
// MODIFIED:
// Removed syncAuthFromBackend. It is called from the wrong places
// and is part of the cause of your state issues.
// ---------------------------------

// =============== AUTH =================

// Login (sets HTTP-only cookie for refresh token + returns idToken)
export async function login(data: { email: string; password: string }) {
  // ---------------------------------
  // MODIFIED:
  // 1. Added '/auth' prefix.
  // 2. Removed *all* state-setting logic (setAccessToken, setRefreshToken, syncAuthFromBackend).
  //    This logic is buggy and causes race conditions.
  //    It will be moved to `user-auth-form.tsx` where it can be
  //    done correctly after decoding the token.
  // ---------------------------------
  const res = await api.post('/auth/login', data, { withCredentials: true })
  return res.data // Just return the data
}

// Refresh (cookie is auto-sent, backend returns new tokens)
export async function refresh() {
  // ---------------------------------
  // MODIFIED:
  // 1. Added '/auth' prefix.
  // 2. Removed *all* state-setting logic.
  //    This function is called by the `axios-client.ts` interceptor,
  //    which is the *correct* place to handle the state update.
  // ---------------------------------
  const res = await api.post('/auth/refresh', {}, { withCredentials: true })
  return res.data
}

// Logout (clears HTTP-only cookie + in-memory token)
export async function logout() {
  // ---------------------------------
  // MODIFIED:
  // 1. Added '/auth' prefix.
  // 2. Kept setAccessToken(null) as it's a good immediate failsafe.
  //    The store reset should be handled in the UI.
  // ---------------------------------
  await api.post('/auth/logout', {}, { withCredentials: true })
  setAccessToken(null)
  setRefreshToken(null) // clear in-memory backup
}

// ... (The `profile` function is also misaligned)

export async function profile(
  data: Record<string, any> = {},
  user_id: string,
  action: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  // ---------------------------------
  // MODIFIED:
  // Your backend `routes/profiles.py` has different routes:
  // GET /profiles/{user_id}
  // POST /profiles/  (Notice: No user_id in URL)
  // PUT /profiles/{user_id}
  // DELETE /profiles/{user_id}
  //
  // The `profile-hooks.ts` file is the better place for this.
  // This function is complex and doesn't match the backend.
  // I have removed the buggy `syncAuthFromBackend(result)` call.
  // ---------------------------------

  const endpoint = `/profiles/${user_id}` // This is only correct for GET, PUT, DELETE

  try {
    console.groupCollapsed(`🔹 [PROFILE ${action}] Request`)
    console.log('➡️ Endpoint:', endpoint)
    console.log('➡️ Data:', data)
    console.groupEnd()

    let res
    switch (action.toUpperCase()) {
      case 'GET':
        res = await api.get(endpoint, { withCredentials: true })
        break
      case 'POST':
        // ---------------------------------
        // MODIFIED:
        // Backend route for POST is /profiles/ and expects user_id in body
        // ---------------------------------
        res = await api.post('/profiles/', data, { withCredentials: true })
        break
      case 'PUT':
        res = await api.put(endpoint, data, { withCredentials: true })
        break
      case 'DELETE':
        res = await api.delete(endpoint, { withCredentials: true })
        break
      default:
        throw new Error(`Unsupported action: ${action}`)
    }

    const result = res.data

    console.groupCollapsed(`✅ [PROFILE ${action}] Response`)
    console.log('⬅️ Status:', res.status)
    console.log('⬅️ Data:', result)
    console.groupEnd()

    // ---------------------------------
    // MODIFIED: REMOVED `syncAuthFromBackend(result)`.
    // This call is dangerous here. It tries to merge profile
    // data as if it were login data, which can break the auth state.
    // ---------------------------------

    return result
  } catch (err: any) {
    console.groupCollapsed(`❌ [PROFILE ${action}] Error`)
    console.error('Error performing action:', action)
    console.error('Endpoint:', endpoint)
    console.error('Response:', err.response?.data || err)
    console.groupEnd()
    throw err
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const result = await sendPasswordResetEmail(auth, email);
    // Firebase may not throw even if user doesn't exist — so log neutrally
    console.log(
      "Password reset requested. If the email exists, a reset link has been sent.", result
    );
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      console.warn(
        "No account found with that email. Firebase did not send a reset email."
      );
    } else if (error.code === "auth/invalid-email") {
      console.warn("Invalid email format. Please check the email address.");
    } else {
      console.error(
        "Unexpected error while sending password reset email:",
        error.message
      );
    }
  }
}