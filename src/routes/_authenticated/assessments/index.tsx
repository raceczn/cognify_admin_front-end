import { createFileRoute } from '@tanstack/react-router'
import { Assessments } from '@/pages/assessments/index'

export const Route = createFileRoute('/_authenticated/assessments/')({
  component: Assessments,
})
