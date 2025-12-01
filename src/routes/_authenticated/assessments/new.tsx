import { createFileRoute } from '@tanstack/react-router'
import AssessmentsNewPage from '@/pages/assessments/new/index'

export const Route = createFileRoute('/_authenticated/assessments/new')({
  component: AssessmentsNewPage,
})
