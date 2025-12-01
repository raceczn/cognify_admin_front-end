import { createFileRoute } from '@tanstack/react-router'
import ModulesNewPage from '@/pages/modules/new/index'

export const Route = createFileRoute('/_authenticated/modules/new')({
  component: ModulesNewPage,
})
