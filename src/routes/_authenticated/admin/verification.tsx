import { createFileRoute } from '@tanstack/react-router'
import VerificationPage from '@/pages/admin/verification'
import { z } from 'zod'

const searchSchema = z.object({
  type: z.enum(['module', 'assessment', 'question']).optional(),
})

export const Route = createFileRoute('/_authenticated/admin/verification')({
  component: VerificationPage,
  validateSearch: (search) => searchSchema.safeParse(search).success ? search : {},
})