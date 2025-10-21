// src/lib/profile-hooks.ts
import api from "@/lib/axios-client";

// Get profile
export async function getProfile(uid: string) {
  const res = await api.get(`/profiles/${uid}`);
  return res.data;
}

// Get all profiles
export async function getAllProfiles() {
  const res = await api.get(`/profiles/all`, { withCredentials: true });
  return res.data;
}

// Create profile
// ---------------------------------
// MODIFIED:
// The backend route for creation is `POST /profiles/` (no uid in URL).
//
// The `user_id` is expected to be *inside* the `data` object.
// ---------------------------------
export async function createProfile(data: any) {
  const res = await api.post(`/profiles/`, data);
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