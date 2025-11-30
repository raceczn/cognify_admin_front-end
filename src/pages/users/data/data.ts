import { UserCheck, Users, UserLock } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['online', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['offline', 'bg-neutral-300/40 border-neutral-300'],
  ['busy', 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'],
])

// These values MUST match the 'role' string generated in users-provider.tsx
export const roles = [
  {
    label: 'Admin',
    value: 'admin', 
    designation: 'admin',
    icon: UserLock,
  },
  {
    label: 'Student',
    value: 'student',
    designation: 'student',
    icon: Users,
  },
  {
    label: 'Faculty Member',
    value: 'faculty_member',
    designation: 'faculty_member',
    icon: UserCheck,
  },
] as const