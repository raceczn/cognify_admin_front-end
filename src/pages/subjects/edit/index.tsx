import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getSubject } from '@/lib/subjects-hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
// Import the UI Tabs components
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubjectMutateForm } from '../components/subjects-mutate-drawer'
import { SubjectsProvider } from '../components/subjects-provider'

export default function SubjectsEditPage() {
  const { subjectId } = useParams({
    from: '/_authenticated/subjects/$subjectId/edit',
  })

  // We control the tab state here so we can pass it to the form
  const [activeTab, setActiveTab] = useState('general')

  const { data, isLoading, error } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubject(subjectId),
    enabled: !!subjectId,
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
          <h1 className='text-2xl font-bold tracking-tight'>Edit Subject</h1>
          <p className='text-muted-foreground'>Update subject information and curriculum.</p>
        </div>

        <div className='flex w-full flex-col gap-6'>
          
          {/* SHADCN TABS IMPLEMENTATION 
            We use 'value' and 'onValueChange' to control the state manually.
            We do NOT use TabsContent, because that would unmount the form 
            and erase data when switching tabs.
          */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
              <TabsTrigger value="general">General Details</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="media">Cover Image</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
            {isLoading ? (
              <div className='space-y-4 p-8'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-1/2' />
              </div>
            ) : error ? (
              <div className='p-8 text-center'>
                <p className='text-destructive font-medium'>Error loading subject data.</p>
                <p className='text-sm text-gray-500'>Please try refreshing the page.</p>
              </div>
            ) : data ? (
              <SubjectsProvider>
                {/* We pass the activeTab to the form so it knows what to show */}
                <SubjectMutateForm subjectId={data.id} activeTab={activeTab} />
              </SubjectsProvider>
            ) : (
              <div className='p-8 text-center'>
                <p className='text-muted-foreground'>Subject not found.</p>
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}