import { UserCheck, Users, UserLock } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['deleted', 'bg-neutral-300/40 border-neutral-300'],
 
])

export const roles = [
  {
    label: 'Admin',
    value: 'PifcrriKAGM6YdWORP5I',
    designation: 'admin',
    icon: UserLock,
  },
  {
    label: 'Student',
    value: 'Tzc78QtZcaVbzFtpHoOL',
    designation: 'student',
    icon: Users,
  },
  {
    label: 'Faculty Member',
    value: 'vhVbVsvMKiogI6rNLS7n',
    designation: 'faculty_member',
    icon: UserCheck,
  },

] as const
