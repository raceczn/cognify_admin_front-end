import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
// ---------------------------------
// MODIFIED: Import the hook
// ---------------------------------
import { getAllProfiles } from '@/lib/profile-hooks' 
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/users/')

// Utility function to capitalize first letter of each word
function capitalizeName(name: string | undefined) {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// ---------------------------------
// MODIFIED: Returns '' instead of 'Null' for empty fields
// ---------------------------------
function normalizeField(name: string | undefined) {
  if (!name || name.trim() === '') return '' 
  return capitalizeName(name)
}

// ---------------------------------
// MODIFIED: Returns '' and handles trim
// ---------------------------------
function middleInitial(name: string | undefined) {
  if (!name || name.trim() === '') return ''
  return name.trim().charAt(0).toUpperCase() + '.'
}

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // ---------------------------------
        // MODIFIED: Use the hook from profile-hooks.ts
        // ---------------------------------
        const allProfiles = await getAllProfiles(); //
        console.log('✅ Fetched users:', allProfiles)
       
        const transformedUsers: User[] = (allProfiles || []).map((profile: any) => ({
          id: profile.id ?? profile.user_id ?? 'N/A',
          first_name: normalizeField(profile.first_name),
          middle_name: middleInitial(profile.middle_name),
          last_name: normalizeField(profile.last_name),
          nickname: normalizeField(profile.nickname),
          username: profile.username ?? 'N/A', // Schema has this, sample doesn't
          email: profile.email ?? 'N/A',
          phoneNumber: profile.phone_number ?? profile.phoneNumber ?? 'N/A',
          status: profile.deleted ? 'deleted' : 'active',
          // ---------------------------------
          // MODIFIED:
          // Use `profile.role` (which is "student", "admin", "faculty_member")
          // We pass it raw so the filter works.
          // ---------------------------------
          role: profile.role ?? 'Not Assigned', 
          createdAt: profile.created_at ?? profile.createdAt ?? 'N/A',
          updatedAt: profile.updated_at ?? profile.updatedAt ?? 'N/A',
        }))
        
        setUsers(transformedUsers)
      } catch (err: any) {
        console.error('❌ Error fetching users:', err)
        // ---------------------------------
        // MODIFIED: Use 'detail' for FastAPI errors
        // ---------------------------------
        setError(err.response?.data?.detail || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // ... (rest of the component JSX is unchanged)
  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>List of All Users</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-muted-foreground'>Loading users...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-destructive'>{error}</p>
            </div>
          ) : (
            <UsersTable data={users} search={search} navigate={navigate} />
          )}
        </div>
      </Main>
      <UsersDialogs />
    </UsersProvider>
  )
}