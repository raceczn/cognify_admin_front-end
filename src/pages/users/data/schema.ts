import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('online'),
  z.literal('offline'),
  z.literal('busy'),
])
export type UserStatus = z.infer<typeof userStatusSchema>


const userSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(), // Allow null
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(), // Allow null
  username: z.string(), // This is likely just the email
  email: z.string(),
  nickname: z.string().nullable(), // Allow null
  status: userStatusSchema.catch('offline'), // Default to offline if status is weird
  role_id: z.string(),
  role: z.string(),
  created_at: z.coerce.date(),
  deleted: z.boolean(),
  deleted_at: z.coerce.date().nullable().optional(), // --- FIX: Add deleted_at ---
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

