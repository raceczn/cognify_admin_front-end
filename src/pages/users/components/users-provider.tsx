'use client'

import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllProfiles, type UserProfile } from '@/lib/profile-hooks'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '../data/schema'
import { roles } from '../data/data'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'purge'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  users: User[]
  loadUsers: (force?: boolean) => Promise<void>
  refreshUsers: () => Promise<void>
  updateLocalUsers: (
    updated: User | User[],
    action: 'add' | 'edit' | 'delete' | 'purge'
  ) => void
  isLoading: boolean
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  
  const queryClient = useQueryClient()
  const QUERY_KEY = ['users-list']

  // [SOLUTION] Use React Query instead of manual fetching
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getAllProfiles()
      
      // Perform the mapping here, once, when data arrives
      if (res && Array.isArray(res.items)) {
        return res.items.map((apiUser: UserProfile) => {
          const roleName = apiUser.role || 
            roles.find((r) => r.value === apiUser.role_id)?.designation || 
            'student'

          return {
            id: apiUser.id,
            first_name: apiUser.first_name || '',
            last_name: apiUser.last_name || '',
            middle_name: apiUser.middle_name || null,
            nickname: apiUser.nickname || null,
            user_name: apiUser.user_name || apiUser.email.split('@')[0],
            email: apiUser.email,
            status: 'offline', // Default status
            role: roleName,
            role_id: apiUser.role_id, // Ensure this exists for logic
            created_at: new Date(apiUser.created_at),
            updated_at: apiUser.updated_at ? new Date(apiUser.updated_at) : new Date(),
            is_verified: apiUser.is_verified || false,
            profile_picture: apiUser.profile_picture || null,
            deleted: apiUser.deleted || false,
            deleted_at: apiUser.deleted_at ? new Date(apiUser.deleted_at) : undefined
          } as User
        })
      }
      return []
    },
    // [CRITICAL] Prevents auto-refetching for 5 minutes, stopping the server clog
    staleTime: 1000 * 60 * 5, 
    // Prevents refetching when you switch windows/tabs (optional, usually good to keep true)
    refetchOnWindowFocus: false, 
  })

  // Wrapper to maintain compatibility with your existing components
  const loadUsers = useCallback(async (force = false) => {
    if (force) {
      await refetch()
    }
    // If not forced, React Query handles the caching, so we do nothing.
  }, [refetch])

  const refreshUsers = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Optimistic Updater
  const updateLocalUsers = useCallback(
    (
      updated: User | User[],
      action: 'add' | 'edit' | 'delete' | 'purge'
    ) => {
      queryClient.setQueryData<User[]>(QUERY_KEY, (oldData = []) => {
        const items = Array.isArray(updated) ? updated : [updated]
        const ids = new Set(items.map(u => u.id))

        switch (action) {
          case 'add':
            return [...items, ...oldData]
          case 'edit':
            return oldData.map(user => 
              ids.has(user.id) 
                ? items.find(i => i.id === user.id)! 
                : user
            )
          case 'delete':
          case 'purge':
            return oldData.filter(user => !ids.has(user.id))
          default:
            return oldData
        }
      })
      
      // Optional: Invalidate to ensure server sync eventually
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    [queryClient]
  )

  return (
    <UsersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        users, // This now comes from React Query
        loadUsers,
        refreshUsers,
        updateLocalUsers,
        isLoading,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const context = React.useContext(UsersContext)
  if (!context) throw new Error('useUsers must be used within <UsersProvider>')
  return context
}