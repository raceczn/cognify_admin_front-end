import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import UsersPage from '@/pages/users' // [FIX] Import default export

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('invited'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  // [FIX] Update role schema to match string designations
  role: z.array(z.string()).optional().catch([]), 
  // Per-column text filter (example for username)
  username: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: UsersPage, // [FIX] Use the imported component
})