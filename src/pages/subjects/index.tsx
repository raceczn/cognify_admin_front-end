import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { SubjectsProvider, useSubjects } from './components/subjects-provider'
import { SubjectsTable } from './components/subjects-table'
import { SubjectsDialogs } from './components/subjects-dialogs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

function SubjectsContent() {
  const { subjects, isLoading, setOpen } = useSubjects()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Subject Management
            </h2>
            <p className='text-muted-foreground'>
              Add, edit, and view course subjects.
            </p>
          </div>
          <Button className='gap-2' onClick={() => setOpen('add')}>
            <span>Add Subject</span> <Plus size={18} />
          </Button>
        </div>

        {/* LAYOUT FIX: Use simple full-width container */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          {isLoading ? (
            <div className='grid grid-cols-1'>
              <Skeleton className='h-32 flex items-center justify-center gap-2'>
                Loading subjects...
              </Skeleton>
            </div>
          ) : (
            <SubjectsTable data={subjects} />
          )}
        </div>
      </Main>
      <SubjectsDialogs />
    </>
  )
}

export function Subjects() {
  return (
    <SubjectsProvider>
      <SubjectsContent />
    </SubjectsProvider>
  )
}