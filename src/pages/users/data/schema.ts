import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>



const userSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
  email: z.string(),
  nickname: z.string(),
  status: userStatusSchema,
  role_id: z.string(),
  role: z.string(),
  created_at: z.coerce.date(),
  // updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
