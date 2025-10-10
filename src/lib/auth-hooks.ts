import api, { setAccessToken } from "@/lib/axios-client";

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

// Login (sets cookie + returns idToken)
export async function login(data: { email: string; password: string }) {
  const res = await api.post("/login", data, { withCredentials: true });
  const token = res.data.token;
  setAccessToken(token); // store access token in memory
  return res.data;
}

// Refresh (use cookie, returns new access token)
export async function refresh() {
  const res = await api.post("/refresh", {}, { withCredentials: true });
  const token = res.data.token;
  setAccessToken(token);
  return res.data;
}

// Logout (deletes cookie)
export async function logout() {
  await api.post("/logout", {}, { withCredentials: true });
  setAccessToken(null);
}
