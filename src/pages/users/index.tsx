import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { Skeleton } from '@/components/ui/skeleton'

const route = getRouteApi('/_authenticated/users/')

// ✅ Separate component to access context
function UsersContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { users, isLoading } = useUsers()
  const [showDeleted, setShowDeleted] = useState(false)

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <label className='text-muted-foreground text-sm'>
              <input
                type='checkbox'
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className='mr-2'
              />
              Show deleted users
            </label>
          </div>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              List of All Users
            </h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='grid grid-cols-1'>
                <Skeleton className='h-32 flex items-center justify-center gap-2'>Loading users...</Skeleton>
              </div>
          ) : (
            <UsersTable
              data={users}
              search={search}
              navigate={navigate}
              showDeleted={showDeleted}
            />
          )}
        </div>
      </Main>
      <UsersDialogs />
    </>
  )
}

export function Users() {
  return (
    <UsersProvider>
      <UsersContent />
    </UsersProvider>
  )
}
