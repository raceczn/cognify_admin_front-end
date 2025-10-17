import api, { setAccessToken, setRefreshToken } from "@/lib/axios-client";
import { syncAuthFromBackend } from "@/stores/auth-store"

// =============== AUTH =================

// Signup (email + password)
export async function signup(data: {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  nickname?: string;
  role_id?: string;
}) {
  const res = await api.post("/signup", data);
  return res.data;
}

// Login (sets HTTP-only cookie for refresh token + returns idToken)
export async function login(data: { email: string; password: string }) {
  const res = await api.post("/login", data, { withCredentials: true })
  const token = res.data.token
  const refreshTokenFromResponse = res.data.refresh_token

  setAccessToken(token)
  if (refreshTokenFromResponse) setRefreshToken(refreshTokenFromResponse)

  syncAuthFromBackend(res.data)
  return res.data
}

// Refresh (cookie is auto-sent, backend returns new tokens)
export async function refresh() {
  const res = await api.post("/refresh", {}, { withCredentials: true })
  const token = res.data.token
  const refreshTokenFromResponse = res.data.refresh_token

  setAccessToken(token)
  if (refreshTokenFromResponse) setRefreshToken(refreshTokenFromResponse)

  syncAuthFromBackend(res.data)
  return res.data
}

// Logout (clears HTTP-only cookie + in-memory token)
export async function logout() {
  await api.post("/logout", {}, { withCredentials: true });
  setAccessToken(null);
  setRefreshToken(null); // clear in-memory backup
}

export async function profile(
  data: Record<string, any> = {},
  user_id: string,
  action: "GET" | "POST" | "PUT" | "DELETE" = "GET"
) {
  const endpoint = `/profiles/${user_id}`

  try {
    console.groupCollapsed(`🔹 [PROFILE ${action}] Request`)
    console.log("➡️ Endpoint:", endpoint)
    console.log("➡️ Data:", data)
    console.groupEnd()

    let res
    switch (action.toUpperCase()) {
      case "GET":
        res = await api.get(endpoint, { withCredentials: true })
        break
      case "POST":
        res = await api.post(endpoint, data, { withCredentials: true })
        break
      case "PUT":
        res = await api.put(endpoint, data, { withCredentials: true })
        break
      case "DELETE":
        res = await api.delete(endpoint, { withCredentials: true })
        break
      default:
        throw new Error(`Unsupported action: ${action}`)
    }

    const result = res.data

    console.groupCollapsed(`✅ [PROFILE ${action}] Response`)
    console.log("⬅️ Status:", res.status)
    console.log("⬅️ Data:", result)
    console.groupEnd()

    // Since backend already returns login-like data
    syncAuthFromBackend(result)

    return result
  } catch (err: any) {
    console.groupCollapsed(`❌ [PROFILE ${action}] Error`)
    console.error("Error performing action:", action)
    console.error("Endpoint:", endpoint)
    console.error("Response:", err.response?.data || err)
    console.groupEnd()
    throw err
  }
}