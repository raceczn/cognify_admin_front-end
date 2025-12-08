// src/lib/profile-hooks.ts
import api from '@/lib/axios-client'

export type UserRole = 'student' | 'faculty_member' | 'admin'

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  middle_name?: string | null
  last_name?: string
  nickname?: string
  user_name?: string
  role?: string 
  role_id: string
  profile_picture?: string
  is_verified?: boolean
  // [FIX] Added is_active to interface
  is_active?: boolean 
  
  pre_assessment_score?: number
  ai_confidence?: number
  current_module?: string
  created_at: string
  updated_at?: string
  deleted: boolean
  deleted_at?: string | null
}

type PaginatedUsersResponse = {
  items: UserProfile[]
  last_doc_id: string | null
}

// Helper to find the actual profile object inside nested responses
const extractProfileData = (data: any) => {
  if (!data) return {}
  if (data.data?.profile) return data.data.profile
  if (data.profile) return data.profile
  if (data.data && !data.data.profile) return data.data
  return data
}

const normalizeProfile = (p: any): UserProfile => {
  const raw = extractProfileData(p)
  
  return {
    id: String(raw.id ?? raw.uid ?? ''),
    email: String(raw.email ?? ''),
    first_name: raw.first_name ?? '',
    middle_name: raw.middle_name ?? null,
    last_name: raw.last_name ?? '',
    nickname: raw.nickname ?? '',
    user_name: raw.user_name ?? raw.username ?? '',
    role: raw.role, 
    role_id: String(raw.role_id ?? ''),
    profile_picture: raw.profile_picture ?? raw.profile_image,
    is_verified: !!raw.is_verified,
    is_active: raw.is_active ?? true, // Default to true if missing
    pre_assessment_score: raw.pre_assessment_score,
    ai_confidence: raw.ai_confidence,
    current_module: raw.current_module,
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at,
    deleted: Boolean(raw.deleted ?? false),
    deleted_at: raw.deleted_at ?? null,
  }
}

// ... (Rest of the file remains unchanged: getMyProfile, updateProfile, etc.)

// ===== Profiles (current user) =====
export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get('/profiles/me')
  return normalizeProfile(res.data)
}

export async function updateMyProfile(
  update: Partial<UserProfile>
): Promise<UserProfile> {
  const res = await api.put('/profiles/me', update)
  return normalizeProfile(res.data)
}

export async function getMyPermissions(): Promise<Record<string, boolean>> {
  const res = await api.get('/profiles/me/permissions')
  return res.data?.permissions ?? res.data ?? {}
}

// ===== Profiles (by user) =====
export async function getProfile(userId: string): Promise<UserProfile> {
  const res = await api.get(`/profiles/user/${userId}`)
  return normalizeProfile(res.data)
}

export async function updateProfile(
  userId: string,
  update: Partial<UserProfile>
): Promise<UserProfile> {
  const res = await api.put(`/profiles/user/${userId}`, update)
  return normalizeProfile(res.data)
}

export async function uploadProfilePicture(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post('/profiles/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ===== Lists =====
export async function listStudents(skip = 0, limit = 50): Promise<UserProfile[]> {
  const res = await api.get('/profiles/students', { params: { skip, limit } })
  const students = res.data?.students ?? res.data?.items ?? res.data ?? []
  return (students as any[]).map(normalizeProfile)
}

export async function listFaculty(skip = 0, limit = 50): Promise<UserProfile[]> {
  const res = await api.get('/profiles/faculty', { params: { skip, limit } })
  const faculty = res.data?.faculty ?? res.data?.items ?? res.data ?? []
  return (faculty as any[]).map(normalizeProfile)
}

export async function searchUsers(params: {
  query: string
  role_filter?: UserRole
  skip?: number
  limit?: number
}): Promise<UserProfile[]> {
  const res = await api.get('/profiles/search', { params })
  const results = res.data?.results ?? res.data ?? []
  return (results as any[]).map(normalizeProfile)
}

// ===== Admin / Statistics =====
export async function getSystemUserStatistics(): Promise<{
  total_subjects: number
  total_modules: number
  pending_modules: number
  total_assessments: number
  pending_assessments: number
  pending_questions: number
  total_users: number
  by_role: Record<string, number>
  verified_users: number
  pending_verification: number
  active_users: number
  whitelist_students: number
  whitelist_faculty: number
}> {
  const res = await api.get('/admin/users/statistics')
  return res.data
}

export async function adminSystemOverview(): Promise<any> {
  const res = await api.get('/profiles/admin/system-overview')
  return res.data
}

export async function getUserGrowthStats(): Promise<{ date: string; new_users: number; total_users: number }[]> {
  const res = await api.get('/admin/users/growth')
  return res.data
}

// Convenience wrapper used by Users List
export async function getAllProfiles(
  skip = 0,
  limit = 100
): Promise<PaginatedUsersResponse> {
  const [students, faculty] = await Promise.all([
    listStudents(skip, limit),
    listFaculty(skip, limit),
  ])
  const items = [...students, ...faculty]
  return { items, last_doc_id: null }
}

// ===== Student details =====
export async function getStudentPerformance(studentId: string): Promise<any> {
  const res = await api.get(`/profiles/student/${studentId}/performance`)
  return res.data
}

export async function getStudentActivity(
  studentId: string,
  limit = 20
): Promise<any> {
  const res = await api.get(`/profiles/student/${studentId}/activity`, {
    params: { limit },
  })
  return res.data
}

// ===== Admin user management =====
export async function createProfile(payload: {
  email: string
  password: string
  first_name?: string
  middle_name?: string
  last_name?: string
  nickname?: string
  user_name?: string
  role_id: string
}): Promise<UserProfile> {
  const res = await api.post('/auth/signup', payload)
  const uid = res.data?.uid ?? res.data?.id ?? res.data?.user_id
  if (!uid) {
    return normalizeProfile(res.data)
  }
  const profile = await getProfile(String(uid))
  return profile
}

export async function purgeProfile(uid: string): Promise<any> {
  const res = await api.post(`/profiles/${uid}/purge`)
  return res.data
}

export async function deactivateUser(
  userId: string,
  reason?: string
): Promise<UserProfile> {
  // 👇 FIX: Added '/' at the end
  const res = await api.post(`/admin/users/${userId}/deactivate/`, null, {
    params: reason ? { reason } : undefined,
  })
  const data = res.data?.profile ?? res.data
  return normalizeProfile(data)
}