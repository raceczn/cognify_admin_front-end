// src/routes/_authenticated/route.tsx

import { Outlet, createFileRoute, Navigate } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { usePermissions } from '@/hooks/use-permissions'
import { Skeleton } from '@/components/ui/skeleton'

// Define the route component structure
export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedRouteComponent,
})

function AuthenticatedRouteComponent() {
  const { isLoading, isError, userRole } = usePermissions() 

  if (isLoading) {
    // 1. Show a loading state while fetching the role designation
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-background">
        <div className="space-y-4 w-96">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="absolute text-muted-foreground text-sm mt-48">
            Validating user permissions...
        </div>
      </div>
    );
  }
  
  // 2. Redirect to Sign In if the request failed or the role is unauthenticated
  // This handles cases where the token is missing or invalid.
  if (isError || userRole === 'unauthenticated') {
      return <Navigate to="/sign-in" />
  }

  // 3. Render the application once permissions are verified
  return (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  )
}