import { createFileRoute } from '@tanstack/react-router'
import Subjects from '@/pages/subjects/index'

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: Subjects,
})
