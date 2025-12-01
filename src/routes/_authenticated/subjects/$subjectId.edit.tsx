import { createFileRoute } from '@tanstack/react-router'
import SubjectsEditPage from '@/pages/subjects/edit/index'

export const Route = createFileRoute(
  '/_authenticated/subjects/$subjectId/edit'
)({
  component: SubjectsEditPage,
})
