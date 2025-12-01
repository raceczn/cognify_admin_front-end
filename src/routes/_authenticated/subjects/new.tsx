import { createFileRoute } from '@tanstack/react-router'
import SubjectsNewPage from '@/pages/subjects/new/index'

export const Route = createFileRoute('/_authenticated/subjects/new')({
  component: SubjectsNewPage,
})
