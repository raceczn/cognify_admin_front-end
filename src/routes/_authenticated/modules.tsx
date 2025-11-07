// src/routes/_authenticated/modules.tsx
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'

// --- FIX: Change this line ---
import { Modules } from '@/pages/modules/index'
// --- END FIX ---

// Search schema for pagination and filtering
const modulesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  subject: z.string().optional().catch(''),
  title: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/modules')({
  validateSearch: modulesSearchSchema,
  component: Modules,
})