// src/pages/users/components/users-provider.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { getAllProfiles } from '@/lib/profile-hooks'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '../data/schema'
import { roles } from '../data/data' // --- 1. Import roles ---

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

// --- 2. Define the paginated response type ---
type PaginatedUsersResponse = {
  items: User[]
  last_doc_id: string | null
}

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  users: User[]
  loadUsers: () => Promise<void>
  refreshUsers: () => Promise<void>
  updateLocalUsers: (
    updated: User | User[],
    action: 'add' | 'edit' | 'delete'
  ) => void
  isLoading: boolean
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      // --- 3. Expect the paginated object ---
      const res: PaginatedUsersResponse = await getAllProfiles()
      
      // --- 4. Check for 'items' array and map roles ---
      if (res && Array.isArray(res.items)) {
        // The backend /profiles/all route already adds the 'role' designation string.
        // But if not, we map it here to be safe for the UI.
        const usersWithRoles = res.items.map(user => ({
          ...user,
          username: user.email, // Ensure username (used in columns) is set
          role: user.role || roles.find(r => r.value === user.role_id)?.designation || 'unknown'
        }))
        setUsers(usersWithRoles)
      } else {
        console.warn("getAllProfiles response was not in the expected format:", res)
        setUsers([])
      }
    } catch (err) {
      console.error('❌ Failed to load users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUsers = loadUsers

  // ✅ NEW: Instantly update UI
  const updateLocalUsers = useCallback(
    async (updated: User | User[], action: 'add' | 'edit' | 'delete') => {
      // First update local state for immediate UI feedback
      setUsers((prev) => {
        if (action === 'add') {
          const added = Array.isArray(updated) ? updated : [updated]
          return [...added, ...prev]
        }
        if (action === 'edit') {
          const u = Array.isArray(updated) ? updated[0] : updated
          return prev.map((usr) => (usr.id === u.id ? { ...usr, ...u } : usr))
        }
        if (action === 'delete') {
          const deletedUsers = Array.isArray(updated) ? updated : [updated]
          const deletedIds = new Set(deletedUsers.map((u) => u.id))
          // --- FIX: Don't filter out, just mark as deleted ---
          // return prev.filter((usr) => !deletedIds.has(usr.id))
          return prev.map(usr => 
            deletedIds.has(usr.id) ? { ...usr, deleted: true } : usr
          )
        }
        return prev
      })

      // Then refresh from server to ensure sync
      await refreshUsers()
    },
    [refreshUsers]
  )

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

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