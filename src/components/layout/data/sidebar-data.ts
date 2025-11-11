// src/components/layout/data/sidebar-data.ts
import {
  LayoutDashboard,
  Monitor,
  HelpCircle,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  MessagesSquare,
  Command,
  BookOpen,
  Library,
} from 'lucide-react'
import { type SidebarData } from '../types'

// Role IDs from your system
export const ROLES = {
  ADMIN: 'PifcrriKAGM6YdWORP5I',
  FACULTY_MEMBER: 'vhVbVsvMKiogI6rNLS7n',
} as const

export const staticSidebarData: Omit<SidebarData, 'user'> = {
  teams: [
    {
      name: 'COGNIFY',
      logo: Command,
      plan: 'Admin View',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          allowedRoles: [ROLES.ADMIN], // Admin and Faculty
        },
        {
          title: 'Analytics',
          url: '/analytics',
          icon: Package,
          allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER], // Both roles
        },
        {
          title: 'User List',
          url: '/users',
          icon: Users,
          allowedRoles: [ROLES.ADMIN], // Admin only
        },
        {
          title: 'Modules',
          url: '/modules',
          icon: BookOpen,
          allowedRoles: [ROLES.ADMIN], // Admin only
        },
        {
          title: 'Subjects',
          url: '/subjects',
          icon: Library,
          allowedRoles: [ROLES.ADMIN], // Admin only
        },
        {
          title: 'Reports & Feedback',
          url: '/reports',
          badge: '3',
          icon: MessagesSquare,
          allowedRoles: [ROLES.ADMIN], // Admin only
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER], // Both roles
          items: [
            { 
              title: 'Profile', 
              url: '/settings', 
              icon: UserCog,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
            },
            { 
              title: 'Account', 
              url: '/settings/account', 
              icon: Wrench,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
            },
            { 
              title: 'Appearance', 
              url: '/settings/appearance', 
              icon: Palette,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
            },
            { 
              title: 'Display', 
              url: '/settings/display', 
              icon: Monitor,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
          allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER], // Both roles
        },
      ],
    },
  ],
}

// Helper function to filter sidebar data based on user role
export function getFilteredSidebarData(userRoleId: string) {
  return {
    ...staticSidebarData,
    navGroups: staticSidebarData.navGroups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => {
            if (!item.allowedRoles) return true
            return item.allowedRoles.includes(userRoleId)
          })
          .map((item) => {
            // Special case: faculty sees Analytics as Dashboard
            if (userRoleId === ROLES.FACULTY_MEMBER && item.title === 'Analytics') {
              return {
                ...item,
                title: 'Dashboard',
                icon: LayoutDashboard,
              }
            }

            // Filter nested items if they exist
            if (item.items) {
              return {
                ...item,
                items: item.items.filter((subItem) => {
                  if (!subItem.allowedRoles) return true
                  return subItem.allowedRoles.includes(userRoleId)
                }),
              }
            }

            return item
          }),
      }))
      .filter((group) => group.items.length > 0),
  }
}