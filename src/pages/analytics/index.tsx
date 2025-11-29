'use client'

import { Users, UserCheck, UserX, Percent, AlertTriangle } from 'lucide-react'
import { useGlobalPredictions } from '@/lib/analytics-hooks'
import { usePermissions } from '@/hooks/use-permissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
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
import { BloomLevelChart } from './components/bloom-level-chart'
import CoreSubjectsPage from './components/core-subject'
import { PredictionsTable } from './components/predictions-table'
import { StudentStatus } from './components/students-status'

function AnalyticsErrorFallback() {
  return (
    <div className='p-4'>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>
          There was an error loading the dashboard data.
          <br />
          <Button
            variant='destructive'
            className='mt-4'
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function Apps() {
  const { isAdmin } = usePermissions()

  const {
    data: predictionData,
    isLoading: isLoadingPredictions,
    error,
  } = useGlobalPredictions()

  console.log(predictionData?.performance_by_bloom);

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
        <AppErrorBoundary fallback={<AnalyticsErrorFallback />}>
          <div className='pr-6'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {isAdmin ? 'Dashboard Analytics' : 'Faculty Dashboard'}
              </h1>
              <p className='text-muted-foreground'>
                Overview of student performance and AI predictions.
              </p>
            </div>
            <div className='my-4'></div>

            {isLoadingPredictions ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Skeleton className='h-32' /><Skeleton className='h-32' />
                <Skeleton className='h-32' /><Skeleton className='h-32' />
              </div>
            ) : summary ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardDescription>Total Students</CardDescription>
                        <Users className='text-muted-foreground size-4' />
                    </div>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.total_students_predicted}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Active in system
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardDescription>Passing Rate</CardDescription>
                        <Percent className='text-muted-foreground size-4' />
                    </div>
                    <CardTitle className='text-3xl font-semibold'>
                      {(summary.predicted_pass_rate || 0).toFixed(1)}%
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    AI Predicted
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardDescription>Predicted Pass</CardDescription>
                        <UserCheck className='text-green-500 size-4' />
                    </div>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.count_predicted_to_pass}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Low Risk
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardDescription>At Risk</CardDescription>
                        <UserX className='text-red-500 size-4' />
                    </div>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.count_predicted_to_fail}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    High Risk
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className='pt-6'>
                  <p className='text-muted-foreground text-center'>
                    No data available.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <BloomLevelChart data={predictionData?.performance_by_bloom} />
              <StudentStatus summary={summary} />
              <CoreSubjectsPage data={predictionData?.subjects} />
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