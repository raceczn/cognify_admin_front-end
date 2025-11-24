import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('online'),
  z.literal('offline'),
  z.literal('busy'),
])
export type UserStatus = z.infer<typeof userStatusSchema>


const userSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(), 
  user_name: z.string(), 
  email: z.string(),
  nickname: z.string().nullable(),
  status: userStatusSchema.catch('offline'), 
  role_id: z.string(),
  role: z.string(),
  created_at: z.coerce.date(),
  deleted: z.boolean(),
  deleted_at: z.coerce.date().nullable().optional(), 
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

