// src/routes/_authenticated/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Dashboard } from '@/pages/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: window.location.pathname },
      })
    }

    // Role-based redirect
    if (user.role_id === 'vhVbVsvMKiogI6rNLS7n') {
      // Faculty role - remove trailing slash
      throw redirect({ to: '/faculty/dashboard' })
    }
  },
  component: Dashboard, // Default is Admin Dashboard
})