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
import api from '@/lib/axios-client'
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

// Utility function to normalize field: capitalize or return italicized "Null"
function normalizeField(name: string | undefined) {
  if (!name || name.trim() === '') return 'Null' // Markdown-style italics
  return capitalizeName(name)
}

// Utility function to get middle initial
function middleInitial(name: string | undefined) {
  if (!name || name.trim() === '') return 'Null'
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
        
        // Fetch users from API
        const res = await api.get('/profiles/all', { withCredentials: true })
        console.log('✅ Fetched users:', res.data)
       
        const transformedUsers: User[] = (res.data || []).map((profile: any) => ({
          id: profile.id ?? profile.user_id ?? 'Null',
          first_name: normalizeField(profile.first_name),
          middle_name: middleInitial(profile.middle_name),
          last_name: normalizeField(profile.last_name),
          nickname: normalizeField(profile.nickname),
          username: profile.username ?? 'Null',
          email: profile.email ?? 'Null',
          phoneNumber: profile.phone_number ?? profile.phoneNumber ?? 'Null',
          status: profile.status ?? 'active',
          role: profile.role ?? profile.role_id ?? 'Null',
          createdAt: profile.created_at ?? profile.createdAt ?? 'Null',
          updatedAt: profile.updated_at ?? profile.updatedAt ?? 'Null',
        }))
        
        setUsers(transformedUsers)
      } catch (err: any) {
        console.error('❌ Error fetching users:', err)
        setError(err.response?.data?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

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
