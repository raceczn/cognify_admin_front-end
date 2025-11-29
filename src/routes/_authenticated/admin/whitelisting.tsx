import { createFileRoute } from '@tanstack/react-router'
import WhitelistingPage from '@/pages/admin/whitelisting'

export const Route = createFileRoute('/_authenticated/admin/whitelisting')({
  component: WhitelistingPage,
})