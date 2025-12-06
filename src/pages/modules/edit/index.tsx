import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getModule } from '@/lib/modules-hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModuleMutateForm } from '../components/modules-mutate-drawer'
import { ModulesProvider } from '../components/modules-provider'

export default function ModulesEditPage() {
  // @ts-ignore
  const { moduleId } = useParams({
    from: '/_authenticated/modules/$moduleId/edit',
  })

  // Default to general tab
  const [activeTab, setActiveTab] = useState('general')

  const { data, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => getModule(moduleId),
    enabled: !!moduleId,
  })

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Module</h1>
          <p className='text-muted-foreground'>Update module information and content.</p>
        </div>

        <div className='flex w-full flex-col gap-6'>
          
          {/* [FIX] Updated Grid Cols to 3 and Added View Trigger */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
              <TabsTrigger value="general">General Details</TabsTrigger>
              <TabsTrigger value="content">Content & Settings</TabsTrigger>
              <TabsTrigger value="view">View Material</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
            {isLoading ? (
              <div className='space-y-4 p-8'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-1/2' />
              </div>
            ) : error ? (
              <div className='p-8 text-center'>
                <p className='text-destructive'>Error loading module.</p>
              </div>
            ) : data ? (
              <ModulesProvider>
                <ModuleMutateForm moduleId={data.id} activeTab={activeTab} />
              </ModulesProvider>
            ) : (
              <div className='p-8 text-center'>
                <p className='text-muted-foreground'>Module not found.</p>
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}