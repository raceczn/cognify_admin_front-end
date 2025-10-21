// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { getProfile } from '@/lib/profile-hooks'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

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

// This is your new root route
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
  
  // This is the global loader that shows while `beforeLoad` is awaiting
  pendingComponent: FullScreenLoader,

  // This is the auth guard logic
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password']
    const currentPath = location.pathname

    if (publicPaths.includes(currentPath)) return

    if (!auth.accessToken || !auth.user?.uid) {
      toast.error('You must be logged in.')
      throw redirect({ to: '/sign-in', search: { redirect: currentPath }, replace: true })
    }
    
    // This is the hardcoded Student Role ID from your backend
    const STUDENT_ROLE_ID = 'Tzc78QtZcaVbzFtpHoOL'
    let userRole = auth.user.role_id || auth.user.profile?.role_id

    if (!userRole) {
      try {
        const fullProfile = await getProfile(auth.user.uid)
        auth.setUser(fullProfile)
        userRole = fullProfile.role_id || fullProfile.profile?.role_id
      } catch (err) {
        toast.error('Session expired. Please log in again.')
        auth.reset()
        throw redirect({ to: '/sign-in', replace: true })
      }
    }

    if (userRole === STUDENT_ROLE_ID) {
      toast.error('Access Denied: Student accounts cannot access this app.')
      auth.reset()
      throw redirect({ to: '/sign-in', replace: true })
    }
  },
})