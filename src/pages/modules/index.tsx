// src/pages/modules/index.tsx
// import { getRouteApi } from '@tanstack/react-router' // Remove
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ModulesProvider,
  useModules,
} from './components/modules-provider'
import { ModulesTable } from './components/modules-table'
import { ModulesDialogs } from './components/modules-dialogs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

// const route = getRouteApi('/_authenticated/modules') // Remove

// Separate component to access context
function ModulesContent() {
  // --- REMOVE search and navigate hooks ---
  // const search = route.useSearch()
  // const navigate = route.useNavigate()
  const { modules, isLoading, setOpen } = useModules()

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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Content Management
            </h2>
            <p className='text-muted-foreground'>
              Manage course modules and generate AI content.
            </p>
          </div>
          <Button className='space-x-2' onClick={() => setOpen('add')}>
            <span>Add Module</span> <Plus size={18} />
          </Button>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='grid grid-cols-1'>
              <Skeleton className='h-32 flex items-center justify-center gap-2'>
                Loading modules...
              </Skeleton>
            </div>
          ) : (
            // --- REMOVE search and navigate props ---
            <ModulesTable data={modules} />
          )}
        </div>
      </Main>
      <ModulesDialogs />
    </>
  )
}

// This is the main export for the route
export function Modules() {
  return (
    <ModulesProvider>
      <ModulesContent />
    </ModulesProvider>
  )
}