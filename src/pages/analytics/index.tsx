// src/pages/analytics/index.tsx
'use client'

import { Users, UserCheck, UserX, Percent, AlertTriangle } from 'lucide-react'
import { useGlobalPredictions } from '@/lib/analytics-hooks'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { AppErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChartRadarDefault } from './components/char-radar'
import CoreSubjectsPage  from './components/core-sub'
import { ChartRadialText } from './components/pie'
import { PredictionsTable } from './components/predictions-table'

// src/pages/analytics/index.tsx

// src/pages/analytics/index.tsx

// src/pages/analytics/index.tsx

// src/pages/analytics/index.tsx

function AnalyticsErrorFallback() {
  return (
    <div className='p-4'>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>
          There was an error loading the main analytics dashboard. This might be
          a temporary issue.
          <br />
          <Button
            variant='destructive'
            className='mt-4'
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function Apps() {
  const {
    data: predictionData,
    isLoading: isLoadingPredictions,
    error,
  } = useGlobalPredictions()

  const summary = predictionData?.summary

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* --- 3. WRAP YOUR MAIN CONTENT WITH THE BOUNDARY --- */}
        <AppErrorBoundary fallback={<AnalyticsErrorFallback />}>
          <div className='pr-6'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Dashboard Analytics
              </h1>
              <p className='text-muted-foreground'>
                Monitor system activity, user growth, and AI-powered
                predictions.
              </p>
            </div>
            <div className='my-4'></div>

            {/* This existing logic is already good for handling loading/error states */}
            {isLoadingPredictions ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Skeleton className='h-28' />
                <Skeleton className='h-28' />
                <Skeleton className='h-28' />
                <Skeleton className='h-28' />
              </div>
            ) : summary ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                  <CardHeader>
                    <CardDescription>Total Students</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.total_students_predicted}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <Users className='mr-1 size-4' />
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Active students analyzed
                  </CardFooter>
                </Card>
                {/* ... other summary cards ... */}
                <Card>
                  <CardHeader>
                    <CardDescription>Predicted Pass Rate</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.predicted_pass_rate.toFixed(2)}%
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <Percent className='mr-1 size-4' />
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Based on current model
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Predicted to Pass</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.count_predicted_to_pass}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <UserCheck className='mr-1 size-4' />
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Students on track
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>At-Risk (Fail)</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.count_predicted_to_fail}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <UserX className='mr-1 size-4' />
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Students needing support
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className='pt-6'>
                  <p className='text-muted-foreground text-center'>
                    {error
                      ? `Error: ${error.message}`
                      : 'No prediction data available. Try running the backend test data script.'}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <ChartRadarDefault />
              <ChartRadialText />
              <CoreSubjectsPage />
            </div>

            <div className='mt-4'>
              <PredictionsTable
                data={predictionData}
                isLoading={isLoadingPredictions}
                error={error as Error | null}
              />
            </div>
          </div>
        </AppErrorBoundary>
      </Main>
    </>
  )
}
