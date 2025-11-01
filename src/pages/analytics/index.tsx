// src/pages/analytics/index.tsx
'use client'

// --- 1. Import the hook, not the function ---
import { Users, UserCheck, UserX, Percent } from 'lucide-react'
import { useGlobalPredictions } from '@/lib/analytics-hooks'
import { Badge } from '@/components/ui/badge'
// --- 2. Import new components ---
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChartLineDefault } from './components/chart-line-default'
import { ChartPieLegend } from './components/chart-pie-legend'
import { ChartTooltipLabelCustom } from './components/chart-tooltip-label-custom'
import { PredictionsTable } from './components/predictions-table'

// src/pages/analytics/index.tsx

// src/pages/analytics/index.tsx

// src/pages/analytics/index.tsx

export function Apps() {
  // --- 3. Fetch global predictions data here for the summary cards ---
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

      {/* --- 4. Use Main WITHOUT 'fixed' prop and add ScrollArea --- */}
      <Main>
        {/* This ScrollArea fixes the cutoff table issue */}
        <ScrollArea className='h-[calc(100vh-4rem)]'>
          {/* Add padding to the right to account for scrollbar */}
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
            {/* 
            <Separator className='my-4 shadow-sm' />

            <h3 className='mb-4 text-lg font-semibold'>
              AI Prediction Summary
            </h3> */}
            {isLoadingPredictions ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Skeleton className='h-28' />
                <Skeleton className='h-28' />
                <Skeleton className='h-28' />
                <Skeleton className='h-28' />
              </div>
            ) : summary ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {/* Total Students */}
                <Card>
                  <CardHeader>
                    <CardDescription>Total Students</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.total_students_predicted}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <Users className='mr-1 size-4' /> +5%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Active students analyzed
                  </CardFooter>
                </Card>

                {/* Predicted Pass Rate */}
                <Card>
                  <CardHeader>
                    <CardDescription>Predicted Pass Rate</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.predicted_pass_rate.toFixed(2)}%
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <Percent className='mr-1 size-4' /> +2%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Based on current model
                  </CardFooter>
                </Card>

                {/* Predicted to Pass */}
                <Card>
                  <CardHeader>
                    <CardDescription>Predicted to Pass</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.count_predicted_to_pass}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <UserCheck className='mr-1 size-4' /> +4%
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className='text-muted-foreground text-sm'>
                    Students on track
                  </CardFooter>
                </Card>

                {/* At-Risk (Fail) */}
                <Card>
                  <CardHeader>
                    <CardDescription>At-Risk (Fail)</CardDescription>
                    <CardTitle className='text-3xl font-semibold'>
                      {summary.count_predicted_to_fail}
                    </CardTitle>
                    <CardAction>
                      <Badge variant='outline'>
                        <UserX className='mr-1 size-4' /> -3%
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
                    No prediction data available.
                  </p>
                </CardContent>
              </Card>
            )}

            <h3 className='my-4 text-lg font-semibold'></h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='flex h-full flex-col'>
                <ChartTooltipLabelCustom />
              </div>
              <div className='flex h-full flex-col'>
                <ChartPieLegend />
              </div>
              <div className='flex h-full flex-col'>
                <ChartLineDefault />
              </div>
            </div>

            <div className='mt-4'>
              {' '}
              <PredictionsTable
                data={predictionData}
                isLoading={isLoadingPredictions}
                error={error as Error | null}
              />
            </div>
          </div>
        </ScrollArea>
      </Main>
    </>
  )
}
