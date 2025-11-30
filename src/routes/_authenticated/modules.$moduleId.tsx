import { createFileRoute } from '@tanstack/react-router'
import { ModuleMutatePage } from '@/pages/modules/components/modules-mutate-drawer'

export const Route = createFileRoute('/_authenticated/modules/$moduleId')({
  component: ModuleMutatePage,
})
