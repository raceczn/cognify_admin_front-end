import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('online'),
  z.literal('offline'),
  z.literal('busy'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable().optional(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(), 
  user_name: z.string().optional(), 
  email: z.string(),
  nickname: z.string().nullable().optional(),
  
  // Status maps to 'is_active' visually (online=active, offline=inactive)
  status: userStatusSchema.catch('offline'), 
  role_id: z.string(),
  
  // [FIX] Added missing fields required by the UI and Provider
  role: z.string().optional(), 
  is_verified: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  
  deleted: z.boolean().optional(),
  
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable().optional(),
  deleted_at: z.coerce.date().nullable().optional(),
  profile_picture: z.coerce.string().nullable().optional()
})

export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)