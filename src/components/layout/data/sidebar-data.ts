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
        
        // --- ADMIN: VERIFICATION ---
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
              title: 'Subjects', // [NEW]
              url: '/admin/verification?type=subject',
              icon: Library,
            },
          ]
        },
        // --- CONTENT MANAGEMENT (Both Roles) ---
        // Renamed section to make it clear this is the "Library"
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

        // {
        //   title: 'Feedback',
        //   url: '/reports',
        //   icon: MessagesSquare,
        //   allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
        // },
      ],
    },
    // ... (Keep 'Other' / Settings section) ...
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
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
          allowedRoles: [ROLES.ADMIN, ROLES.FACULTY_MEMBER],
        },
      ],
    },
  ],
}

// ... (Keep getFilteredSidebarData helper) ...
export function getFilteredSidebarData(userRole: string) {
  const normalizedRole = userRole.toLowerCase();
  return {
    ...staticSidebarData,
    navGroups: staticSidebarData.navGroups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => {
            if (!item.allowedRoles) return true
            return item.allowedRoles.includes(normalizedRole as any)
          })
          .map((item) => {
            if (normalizedRole === ROLES.FACULTY_MEMBER && item.title === 'Dashboard') {
              return { ...item, url: '/faculty/dashboard' }
            }
            if (item.items) {
              return {
                ...item,
                items: item.items.filter((subItem) => {
                  if (!subItem.allowedRoles) return true
                  return subItem.allowedRoles.includes(normalizedRole as any)
                }),
              }
            }
            return item
          }),
      }))
      .filter((group) => group.items.length > 0),
  }
}