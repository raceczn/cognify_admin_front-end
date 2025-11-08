import { AlertTriangle } from 'lucide-react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import React from 'react' // Import React

// This is the DEFAULT fallback component that will be rendered if no other is provided
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Alert variant='destructive' className='m-4'>
      <AlertTriangle className='h-4 w-4' />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        <p>An unexpected error occurred. Please try again.</p>
        <pre className='mt-2 whitespace-pre-wrap text-xs'>
          {error.message}
        </pre>
        <Button
          variant='destructive'
          size='sm'
          onClick={resetErrorBoundary}
          className='mt-4'
        >
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// --- THIS IS THE FIX ---

// Define the props for our wrapper
interface AppErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactElement | null // Accept an optional fallback element
}

// This is the component you will wrap your pages with
export function AppErrorBoundary({
  children,
  fallback = null, // Default to null if not provided
}: AppErrorBoundaryProps) {
  
  const handleReset = () => {
    // A full page reload is the simplest "reset"
    window.location.reload()
  }

  // If a custom fallback is provided, render an ErrorBoundary WITH the 'fallback' prop.
  if (fallback) {
    return (
      <ErrorBoundary fallback={fallback} onReset={handleReset}>
        {children}
      </ErrorBoundary>
    )
  }

  // Otherwise, render an ErrorBoundary WITH the 'FallbackComponent' prop.
  return (
    <ErrorBoundary FallbackComponent={DefaultErrorFallback} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  )
}