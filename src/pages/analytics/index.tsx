// src/pages/analytics/index.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
// --- 1. Import the hook, not the function ---
import { useGlobalPredictions } from '@/lib/analytics-hooks'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChartAreaInteractive } from './components/Usergrowth'
import { ChartPieSimple } from './components/Role-piechart'
import { PredictionsTable } from './components/predictions-table'
// --- 2. Import new components ---
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserCheck, UserX, Percent } from 'lucide-react'

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
                Monitor system activity, user growth, and AI-powered predictions.
              </p>
            </div>

            <Separator className='my-4 shadow-sm' />

            {/* --- 5. Add new Summary Cards --- */}
            <h3 className='mb-4 text-lg font-semibold'>
              AI Prediction Summary
            </h3>
            {isLoadingPredictions ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Skeleton className='h-32' />
                <Skeleton className='h-32' />
                <Skeleton className='h-32' />
                <Skeleton className='h-32' />
              </div>
            ) : summary ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                  <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Students
                    </CardTitle>
                    <Users className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {summary.total_students_predicted}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Active students analyzed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Predicted Pass Rate
                    </CardTitle>
                    <Percent className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {summary.predicted_pass_rate.toFixed(2)}%
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Based on current model
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Predicted to Pass
                    </CardTitle>
                    <UserCheck className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {summary.count_predicted_to_pass}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Students on track
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      At-Risk (Fail)
                    </CardTitle>
                    <UserX className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {summary.count_predicted_to_fail}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Students needing support
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className='pt-6'>
                  <p className='text-center text-muted-foreground'>
                    No prediction data available.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* --- 6. Existing Charts (now with margin) --- */}
            <h3 className='my-4 text-lg font-semibold'>User Growth</h3>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='w-full sm:w-[70%]'>
                <ChartAreaInteractive />
              </div>
              <div className='w-full sm:w-[30%]'>
                <ChartPieSimple />
              </div>
            </div>

            {/* --- 7. Pass data down to Predictions Table --- */}
            <div className='mt-4'>
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

