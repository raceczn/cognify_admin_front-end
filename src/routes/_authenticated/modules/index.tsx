import { createFileRoute } from '@tanstack/react-router'
import Modules from '@/pages/modules/index'

export const Route = createFileRoute('/_authenticated/modules/')({
  component: Modules,
})
