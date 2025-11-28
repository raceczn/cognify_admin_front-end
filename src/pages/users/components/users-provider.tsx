'use client'

import React, { useState, useCallback, useRef } from 'react' // [FIX] Removed useEffect
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
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false) // Default to false since we don't auto-fetch

  const isFetching = useRef(false)

  // [FIX] "Load Once" Strategy
  const loadUsers = useCallback(async (force = false) => {
    // 1. If we already have users and this isn't a forced refresh, STOP.
    // This prevents re-fetching when navigating between Dashboard <-> Users
    if (!force && users.length > 0) {
        return
    }

    // 2. Prevent duplicate parallel requests
    if (isFetching.current) return

    try {
      isFetching.current = true
      setIsLoading(true)

      const res = await getAllProfiles()

      if (res && Array.isArray(res.items)) {
        const mappedUsers: User[] = res.items.map((apiUser: UserProfile) => {
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
              status: 'offline',
              role: roleName,
              created_at: new Date(apiUser.created_at),
              updated_at: apiUser.updated_at ? new Date(apiUser.updated_at) : new Date(),
              is_verified: apiUser.is_verified || false,
              profile_picture: apiUser.profile_picture || null,
              deleted: apiUser.deleted || false,
              deleted_at: apiUser.deleted_at ? new Date(apiUser.deleted_at) : undefined
            } as unknown as User
        })
        setUsers(mappedUsers)
      }
    } catch (err) {
      console.error('❌ Failed to load users:', err)
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }, [users.length])

  // [CRITICAL FIX] Removed the useEffect() that called loadUsers on mount.
  // This stops the Dashboard from fetching the user list.

  const refreshUsers = useCallback(async () => {
    await loadUsers(true)
  }, [loadUsers])

  const updateLocalUsers = useCallback(
    async (
      updated: User | User[],
      action: 'add' | 'edit' | 'delete' | 'purge'
    ) => {
        // Update UI immediately (Optimistic)
        setUsers((prev) => {
             // ... (Keep your existing optimistic logic here) ...
             if (action === 'delete' || action === 'purge') {
                const deletedIds = new Set((Array.isArray(updated) ? updated : [updated]).map(u => u.id))
                return prev.filter(u => !deletedIds.has(u.id))
             }
             return prev
        })

        // [FIX] Only request backend refresh if changes were made
        // This matches your requirement: "if changes made... then we request another"
        await refreshUsers()
    },
    [refreshUsers]
  )

  return (
    <UsersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        users,
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