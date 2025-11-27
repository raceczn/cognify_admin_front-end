// src/routes/_authenticated/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dashboard } from '@/pages/dashboard'
import { useAuthStore } from '@/stores/auth-store'

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
      // Redirect faculty to the URL path generated for the route
      throw redirect({ to: '/faculty/dashboard' })
    }
  },
  component: Dashboard, // Default is Admin Dashboard
})
