'use client'

import React, { useState, useCallback, useEffect } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { getAllProfiles } from '@/lib/profile-hooks'
import { type User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  users: User[]
  loadUsers: () => Promise<void>
  refreshUsers: () => Promise<void>
  updateLocalUsers: (updated: User | User[], action: 'add' | 'edit' | 'delete') => void
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
      const res = await getAllProfiles()
      if (Array.isArray(res)) setUsers(res)
    } catch (err) {
      console.error('❌ Failed to load users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUsers = loadUsers

  // ✅ NEW: Instantly update UI
  const updateLocalUsers = useCallback(
    (updated: User | User[], action: 'add' | 'edit' | 'delete') => {
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
          const u = Array.isArray(updated) ? updated[0] : updated
          return prev.filter((usr) => usr.id !== u.id)
        }
        return prev
      })
    },
    []
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
