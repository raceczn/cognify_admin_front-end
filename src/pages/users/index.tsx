import { useUsers } from './components/users-provider'
import { usersColumns } from './components/users-columns'
import { DataTable } from './components/users-table'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
// 👇 1. Import the Dialogs manager
import { UsersDialogs } from './components/users-dialogs' 
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const topNavLinks = [
  { title: 'Overview', href: '/', isActive: false, disabled: false },
  { title: 'Users', href: '/users', isActive: true, disabled: false },
  { title: 'Analytics', href: '/analytics', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

export default function UsersPage() {
  const { users, isLoading } = useUsers()

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User Management</h2>
            <p className='text-muted-foreground'>
              Manage students, faculty, and administrators.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable 
            data={users} 
            columns={usersColumns} 
            loading={isLoading} 
          />
        </div>

        {/* 👇 2. Add this component here. It listens for the "delete/purge" events */}
        <UsersDialogs />
      </Main>
    </>
  )
}