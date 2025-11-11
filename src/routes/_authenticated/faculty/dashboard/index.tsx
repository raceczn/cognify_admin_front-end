import { createFileRoute } from '@tanstack/react-router'
import { FacultyAdmin } from '@/pages/faculty/dashboard'

export const Route = createFileRoute('/_authenticated/faculty/dashboard/')({
  component: FacultyAdmin,
})


