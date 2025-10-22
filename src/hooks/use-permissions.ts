import { roles } from '@/pages/users/data/data'
import { useAuthStore } from '@/stores/auth-store'

type Permission =
  | 'view_all_users'
  | 'view_students'
  | 'edit_users'
  | 'delete_users'
  | 'view_dashboard'
  | 'edit_own_profile'

export function usePermissions() {
  const { auth } = useAuthStore()

  const userRoleId = auth.user?.role_id || auth.user?.profile?.role_id
  const roleDesignation = roles.find((r) => r.value === userRoleId)?.designation

  const checkPermission = (permission: Permission): boolean => {
    // If no role, no permissions
    if (!roleDesignation) return false

    switch (permission) {
      case 'view_all_users':
        return roleDesignation === 'admin'

      case 'view_students':
        return (
          roleDesignation === 'admin' || roleDesignation === 'faculty_member'
        )

      case 'edit_users':
        return roleDesignation === 'admin'

      case 'delete_users':
        return roleDesignation === 'admin'

      case 'view_dashboard':
        return (
          roleDesignation === 'admin' || roleDesignation === 'faculty_member'
        )

      case 'edit_own_profile':
        return true // Everyone can edit their own profile

      default:
        return false
    }
  }

  return {
    checkPermission,
    isAdmin: roleDesignation === 'admin',
    isFaculty: roleDesignation === 'faculty_member',
    roleDesignation,
  }
}
