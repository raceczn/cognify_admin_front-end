import { createFileRoute } from '@tanstack/react-router'
import AssessmentsEditPage from '@/pages/assessments/edit/index'

export const Route = createFileRoute('/_authenticated/assessments/$assessmentId/edit')({
  component: AssessmentsEditPage,
})
