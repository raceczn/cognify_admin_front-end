import { createFileRoute } from '@tanstack/react-router'
import ModulesEditPage from '@/pages/modules/edit/index'

export const Route = createFileRoute('/_authenticated/modules/$moduleId/edit')({
  component: ModulesEditPage,
})
