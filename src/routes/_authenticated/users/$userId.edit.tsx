import { createFileRoute } from '@tanstack/react-router'
import UserEditPage from '@/pages/users/edit'

export const Route = createFileRoute('/_authenticated/users/$userId/edit')({
  component: UserEditPage,
})