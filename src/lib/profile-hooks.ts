// src/lib/profile-hooks.ts
import api from "@/lib/axios-client";

// Get personal profile (this will be GET /profiles/)
export async function getPersonalProfile() {
  const res = await api.get(`/profiles/`);
  // --- FIX: Return res.data directly ---
  return res.data; 
}

// Get profile by ID (for admins)
export async function getProfile(uid: string) {
  const res = await api.get(`/profiles/${uid}`);
  return res.data; // This is correct
}

// Get all profiles (for admins/faculty)
export async function getAllProfiles() {
  const res = await api.get(`/profiles/all`);
  return res.data; // This is correct
}

// Get deleted profiles (for admins)
export async function getDeletedProfiles() {
  const res = await api.get(`/profiles/deleted`);
  return res.data; // This is correct
}

// Create profile (for admins)
export async function createProfile(data: any) {
  // This calls POST /profiles/
  const res = await api.post(`/profiles/`, data);
  return res.data; // This is correct
}

// Update profile (for self or admin)
export async function updateProfile(uid: string, updates: any) {
  const res = await api.put(`/profiles/${uid}`, updates);
  // --- FIX: Return res.data directly ---
  return res.data; 
}

// Soft-delete profile (for admin)
export async function deleteProfile(uid: string) {
  const res = await api.delete(`/profiles/${uid}`);
  // --- FIX: Return res.data (the full soft-deleted profile) ---
  return res.data;
}

// Restore profile (for admin)
export async function restoreProfile(uid: string) {
  const res = await api.post(`/profiles/restore/${uid}`);
  return res.data; // This is correct
}
