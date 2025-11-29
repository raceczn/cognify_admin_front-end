// src/routes/_authenticated/route.tsx

import { Outlet, createFileRoute } from '@tanstack/react-router'
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
  
  // 2. Access Denied if the request failed or the role is unauthenticated
  if (isError || userRole === 'unauthenticated') {
      // In a real app, this should force a redirect to the sign-in page,
      // but for component structure, we show the forbidden error page.
      // Assuming a general error page component exists for unauthorized access:
      return (
          <div className="h-screen flex items-center justify-center">
              <div className="text-center p-8">
                <h1 className="text-4xl font-bold text-destructive">403</h1>
                <p className="text-xl text-muted-foreground mt-2">Access Denied</p>
                <p className="mt-4 text-sm">Your session is invalid or your role does not permit access.</p>
                {/* Add link/button to redirect to /sign-in */}
              </div>
          </div>
      )
  }

  // 3. Render the application once permissions are verified
  return (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  )
}