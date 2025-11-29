'use client'

import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/lib/profile-hooks'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserForm } from '../components/user-form'
import { User } from '../data/schema'

export default function UserEditPage() {
  // @ts-ignore
  const { userId } = useParams({ from: '/_authenticated/users/$userId/edit' })

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  })

  // Normalize Profile to User Schema for the Form
  const user: User | undefined = profile ? {
    ...profile,
    id: profile.id,
    first_name: profile.first_name ?? null,
    middle_name: profile.middle_name ?? null,
    last_name: profile.last_name ?? null,
    user_name: profile.user_name ?? '',
    email: profile.email ?? '',
    nickname: profile.nickname ?? null,
    role: profile.role ?? 'unknown',
    status: (profile.status === 'online' || profile.status === 'offline' || profile.status === 'busy')
      ? (profile.status as 'online' | 'offline' | 'busy')
      : 'offline',
    profile_picture: profile.profile_picture ?? null,
    created_at: new Date(profile.created_at),
    updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
    deleted: !!profile.deleted,
    deleted_at: profile.deleted_at ? new Date(profile.deleted_at) : undefined,
    role_id: profile.role_id
  } : undefined

  return (
    <>
      <Header>
        <div className="flex items-center gap-4 ml-auto">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6">
          <h1 className='text-2xl font-bold tracking-tight'>Edit User</h1>
          <p className='text-muted-foreground'>
            Update user information and permissions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : error ? (
               <p className="text-destructive">Error loading user: {(error as Error).message}</p>
            ) : user ? (
              <UserForm user={user} />
            ) : (
              <p className="text-muted-foreground">User not found.</p>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}