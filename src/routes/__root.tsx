// src/routes/__root.tsx
import { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getMyProfile } from '@/lib/profile-hooks'

// Define the context for your router
interface MyRouterContext {
  queryClient: QueryClient
}

// Helper: A full-screen loader
const FullScreenLoader = () => (
  <div className='flex h-screen w-full items-center justify-center'>
    <Loader2 className='h-12 w-12 animate-spin' />
  </div>
)

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),

  pendingComponent: FullScreenLoader,

  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password']
    const currentPath = location.pathname

    if (publicPaths.includes(currentPath)) return

    // 1. Check if user is logged in (UID exists)
    if (!auth.user?.uid) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }

    // 2. Resolve Role Designation (Name)
    // We prefer the name (e.g. 'student') over the ID because IDs might change between DB resets.
    let userRole = auth.user.profile?.role

    // If role is missing in store, force a profile fetch
    if (!userRole) {
      try {
        const profile = await getMyProfile()
        const currentUser = auth.user

        if (currentUser) {
          auth.setUser({
            ...currentUser,
            role_id: profile.role_id || currentUser.role_id,
            email: profile.email || currentUser.email,
            profile: {
              ...currentUser.profile,
              ...profile,
            },
          })
        }
        userRole = profile.role // 'student' | 'faculty_member' | 'admin'
      } catch (err) {
        toast.error('Session expired. Please log in again.')
        auth.reset()
        throw redirect({ to: '/sign-in', replace: true })
      }
    }

    // 3. Permission Checks based on Role Name
    if (userRole === 'student') {
      toast.error('Access Denied: Student accounts cannot access this portal.')
      // Optional: Redirect students to a mobile app download page or a specific student view
      auth.reset() 
      throw redirect({ to: '/sign-in', replace: true })
    } 
    
    if (userRole !== 'admin' && userRole !== 'faculty_member') {
      toast.error('Access Denied: You must be a faculty member or admin.')
      auth.reset()
      throw redirect({ to: '/sign-in', replace: true })
    }
  },
})