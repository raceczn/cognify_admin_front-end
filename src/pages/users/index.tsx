import { useEffect } from 'react'
import { useUsers } from './components/users-provider' // Adjust path if needed
import { columns } from './components/columns' // Assuming you have columns defined
import { DataTable } from './components/users-table' // Assuming you have a DataTable component
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function UsersPage() {
  // 1. Get the load function from our provider
  const { users, loadUsers, isLoading } = useUsers()

  // 2. [FIX] Trigger the fetch ONLY when this page mounts
  useEffect(() => {
    loadUsers() 
  }, [loadUsers])

  return (
    <>
      {/* Header Section */}
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
        
        {/* User Table Section */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable 
            data={users} 
            columns={columns} 
            loading={isLoading} // Pass loading state if your table supports it
          />
        </div>
      </Main>
    </>
  )
}

const topNavLinks = [
  {
    title: 'Overview',
    href: '/',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Users',
    href: '/users',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
]