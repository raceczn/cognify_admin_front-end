'use client'

import React, { useState, useCallback } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { getAllProfiles } from '@/lib/profile-hooks' // 👈 Make sure this exists
import { type User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  users: User[]                   // ✅ store the fetched user list
  loadUsers: () => Promise<void>  // ✅ function to reload data
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // ✅ Fetch users from backend
  const loadUsers = useCallback(async () => {
    try {
      const res = await getAllProfiles()
      setUsers(res)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }, [])

  // Optionally, load once on mount
  React.useEffect(() => {
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
        loadUsers, // 👈 expose reload
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)
  if (!usersContext) {
    throw new Error('useUsers must be used within <UsersProvider>')
  }
  return usersContext
}
