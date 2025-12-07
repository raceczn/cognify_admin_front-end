import {
  LayoutDashboard,
  Monitor,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  Command,
  BookOpen,
  Clipboard,
  Library,
  ClipboardCheck,
  UserPlus,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const ROLES = {
  ADMIN: 'admin',
  FACULTY_MEMBER: 'faculty_member',
  STUDENT: 'student',
} as const

export const staticSidebarData: Omit<SidebarData, 'user'> = {
  teams: [
    {
      name: 'COGNIFY',
      logo: Command,
      plan: 'System V2',
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
          allowedRoles: [ROLES.ADMIN],
        },
        {
          title: 'User List',
          url: '/users',
          icon: Users,
          allowedRoles: [ROLES.ADMIN], 
        },
        {
          title: 'Whitelisting',
          url: '/admin/whitelisting',
          icon: UserPlus,
          allowedRoles: [ROLES.ADMIN],
        },
        {
          title: 'Analytics',
          url: '/analytics',
          icon: Package,
          allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER], 
        },
        
        // --- ADMIN: VERIFICATION (Enabled) ---
        {
          title: 'Verification',
          icon: ClipboardCheck,
          allowedRoles: [ROLES.ADMIN],
          items: [
            {
              title: 'All Pending',
              url: '/admin/verification',
              icon: ClipboardCheck,
            },
            {
              title: 'Modules',
              url: '/admin/verification?type=module',
              icon: BookOpen,
            },
            {
              title: 'Assessments',
              url: '/admin/verification?type=assessment',
              icon: Clipboard,
            },
            {
              title: 'Subjects', 
              url: '/admin/verification?type=subject',
              icon: Library,
            },
          ]
        },
        
        // --- CONTENT MANAGEMENT (Both Roles) ---
        {
          title: 'Content Library',
          icon: BookOpen, 
          items: [
            {
              title: 'Subjects',
              url: '/subjects',
              icon: Library,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER], 
            },
            {
              title: 'Modules',
              url: '/modules',
              icon: BookOpen,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
            },
            {
              title: 'Assessments',
              url: '/assessments',
              icon: Clipboard,
              allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER], 
            },
          ]
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
          items: [
            { title: 'Profile', url: '/settings', icon: UserCog },
            { title: 'Account', url: '/settings/account', icon: Wrench },
            { title: 'Appearance', url: '/settings/appearance', icon: Palette },
            { title: 'Notifications', url: '/settings/notifications', icon: Bell },
            { title: 'Display', url: '/settings/display', icon: Monitor },
          ],
        },
      ],
    },
  ],
}

export function getFilteredSidebarData(userRole: string): SidebarData {
  const normalizedRole = userRole.toLowerCase();
  return {
    ...staticSidebarData,
    user: { name: '', email: '', avatar: '' },
    navGroups: staticSidebarData.navGroups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => {
            if (!item.allowedRoles) return true
            return item.allowedRoles.includes(normalizedRole as any)
          })
          .map((item): import('../types').NavItem => {
            if (isCollapsible(item)) {
              const { url, items, ...rest } = item as any
              return {
                ...rest,
                items: items.filter((subItem: any) => {
                  if (!subItem.allowedRoles) return true
                  return subItem.allowedRoles.includes(normalizedRole as any)
                }),
              }
            }
            if (normalizedRole === ROLES.FACULTY_MEMBER && item.title === 'Dashboard') {
              return { ...item, url: '/faculty/dashboard' }
            }
            return item
          }),
      }))
      .filter((group) => group.items.length > 0),
  }
}

function isCollapsible(item: import('../types').NavItem): item is import('../types').NavCollapsible {
  return Array.isArray((item as any).items)
}