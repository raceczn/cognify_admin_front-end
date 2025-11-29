// src/routes/_authenticated/subjects.tsx
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import Subjects from '@/pages/subjects/index'

// Search schema for pagination and filtering
const subjectsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/subjects')({
  validateSearch: subjectsSearchSchema,
  component: Subjects,
})