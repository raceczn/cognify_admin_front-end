import api from "@/lib/axios-client";

// Get profile
export async function getProfile(uid: string) {
  const res = await api.get(`/profiles/${uid}`);
  return res.data;
}

// Create profile
export async function createProfile(uid: string, data: any) {
  const res = await api.post(`/profiles/${uid}`, data);
  return res.data;
}

// Update profile
export async function updateProfile(uid: string, updates: any) {
  const res = await api.put(`/profiles/${uid}`, updates);
  return res.data;
}

// Soft-delete profile
export async function deleteProfile(uid: string) {
  const res = await api.delete(`/profiles/${uid}`);
  return res.data;
}
