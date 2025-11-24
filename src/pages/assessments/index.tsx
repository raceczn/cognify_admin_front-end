// src/pages/assessments/index.tsx
import { useState } from 'react'
import { ArrowLeft, Search as SearchIcon, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'

// Import Separated Components and Hook
import { useAssessments } from '@/hooks/useAssessments'
import { AssessmentList } from '@/pages/assessments/components/AssessmentList'
import { AssessmentEditor } from '@/pages/assessments/components/AssessmentEditor'
import { Assessment } from './data/assessment'


// --- COMPONENT: Assessments (Main Layout) ---
export function Assessments() {
  const {
    search,
    setSearch,
    assessments, // Filtered list
    selectedAssessment,
    handleSelectAssessment,
    handleUpdateAssessment,
    handleNewAssessment,
  } = useAssessments()
  
  // Mobile state management for showing/hiding the editor panel
  const [mobileSelectedAssessment, setMobileSelectedAssessment] = useState(false)
  
  const handleSelectAssessmentWithMobile = (assessment: Assessment) => {
    handleSelectAssessment(assessment)
    setMobileSelectedAssessment(true) // Open editor on mobile
  }

  
  const handleCloseMobileEditor = () => {
    setMobileSelectedAssessment(false)
    // Optional: Also clear selectedAssessment if you want the list to reset
    // handleSelectAssessment(null) 
  }

  // Use the selectedAssessment state from the hook
  const isAssessmentSelected = selectedAssessment !== null
  
  return (
    <>
      {/* ===== Top Heading (Header) ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side (Assessment List) */}
          <div className={cn(
            'flex w-full flex-col gap-2 sm:w-64 lg:w-80 2xl:w-96',
            mobileSelectedAssessment && 'hidden sm:flex' // Hide list on mobile if editor is open
          )}>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Assessments</h1>
                </div>
              </div>

              <label
                className={cn(
                  'focus-within:ring-ring focus-within:ring-1 focus-within:outline-hidden',
                  'border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2'
                )}
              >
                <SearchIcon size={15} className='me-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search assessment...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <AssessmentList
                assessments={assessments} // Filtered list from hook
                selectedAssessment={selectedAssessment}
                onSelectAssessment={handleSelectAssessmentWithMobile} // Use mobile wrapper
                onNewAssessment={handleNewAssessment}
            />
          </div>

          {/* Right Side (Assessment Editor Panel) */}
          {isAssessmentSelected ? (
            <div
              className={cn(
                'bg-background absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md overflow-auto',
                mobileSelectedAssessment && 'start-0 flex'
              )}
            >
              {/* Top Part - Assessment Title Bar */}
              <div className='bg-card mb-1 flex flex-none justify-between p-4 shadow-lg sm:rounded-t-md'>
                <div className='flex gap-3 items-center'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ms-2 h-full sm:hidden'
                    onClick={handleCloseMobileEditor}
                  >
                    <ArrowLeft className='rtl:rotate-180' />
                  </Button>
                  <h2 className='text-xl font-semibold line-clamp-1'>
                    {selectedAssessment.title}
                  </h2>
                  <Badge variant='outline' className='text-sm font-normal'>
                    ID: {selectedAssessment.id}
                  </Badge>
                </div>
              </div>

              {/* Assessment Editor Content */}
              <ScrollArea className='flex-1'>
                {/* Key prop ensures AssessmentEditor remounts and resets internal state when switching assessments */}
                <AssessmentEditor 
                    key={selectedAssessment.id} 
                    assessment={selectedAssessment} 
                    onUpdateAssessment={handleUpdateAssessment}
                />
              </ScrollArea>
            </div>
          ) : (
            <div
              className={cn(
                'bg-card absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:static sm:z-auto sm:flex',
                !mobileSelectedAssessment && 'flex' // Ensure it shows if no assessment is selected, on desktop
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <Pencil className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>
                    Select or Create an Assessment
                  </h1>
                  <p className='text-muted-foreground text-sm'>
                    Select an assessment from the list to edit its content and details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </Main>
    </>
  )
}