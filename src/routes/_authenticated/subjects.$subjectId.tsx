import { createFileRoute } from '@tanstack/react-router'
import { SubjectMutatePage } from '@/pages/subjects/components/subjects-mutate-drawer'

export const Route = createFileRoute('/_authenticated/subjects/$subjectId')({
  component: SubjectMutatePage,
})
  