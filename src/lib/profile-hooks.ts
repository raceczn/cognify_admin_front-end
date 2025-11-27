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
  role?: UserRole
  role_id: string
  profile_picture?: string
  is_verified?: boolean
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

const normalizeProfile = (p: any): UserProfile => ({
  id: String(p.id ?? p.uid ?? ''),
  email: String(p.email ?? ''),
  first_name: p.first_name ?? '',
  middle_name: p.middle_name ?? null,
  last_name: p.last_name ?? '',
  nickname: p.nickname ?? '',
  user_name: p.user_name ?? '',
  role: (p.role as UserRole) ?? undefined,
  role_id: String(p.role_id ?? ''),
  profile_picture: p.profile_picture ?? undefined,
  is_verified: p.is_verified ?? undefined,
  pre_assessment_score: p.pre_assessment_score ?? undefined,
  ai_confidence: p.ai_confidence ?? undefined,
  current_module: p.current_module ?? undefined,
  created_at: p.created_at ?? new Date().toISOString(),
  updated_at: p.updated_at ?? undefined,
  deleted: Boolean(p.deleted ?? false),
  deleted_at: p.deleted_at ?? null,
})

// ===== Profiles (current user) =====
export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get('/profiles/me')
  const payload = res.data

  // Backend shape example:
  // { role: 'admin', data: { profile: { ... }, system_statistics: { ... } } }
  const role = (payload?.role as UserRole) ?? undefined
  const data = payload?.data?.profile ?? payload?.profile ?? payload

  // Normalize only the profile fields; attach role designation if present
  return normalizeProfile({ ...data, role })
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

// ===== Lists =====
export async function listStudents(
  skip = 0,
  limit = 50
): Promise<UserProfile[]> {
  const res = await api.get('/profiles/students', { params: { skip, limit } })
  const students = res.data?.students ?? res.data?.items ?? res.data ?? []
  return (students as any[]).map(normalizeProfile)
}

export async function listFaculty(
  skip = 0,
  limit = 50
): Promise<UserProfile[]> {
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
export async function adminSystemOverview(): Promise<any> {
  const res = await api.get('/profiles/admin/system-overview')
  return res.data
}

// Convenience wrapper used by Dashboard to get a combined list
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
  // Use signup endpoint to create the account, then fetch profile
  const res = await api.post('/auth/signup', payload)
  const uid = res.data?.uid ?? res.data?.id ?? res.data?.user_id
  if (!uid) {
    // If backend returns the full profile directly
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
  const res = await api.post(`/admin/users/${userId}/deactivate`, null, {
    params: reason ? { reason } : undefined,
  })
  const data = res.data?.profile ?? res.data
  return normalizeProfile(data)
}
