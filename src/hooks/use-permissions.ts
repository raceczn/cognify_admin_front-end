// src/hooks/use-permissions.ts
// Final version for strict API-driven role check (POST /auth/permission)

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios-client' 

// Define the authoritative role strings
export type UserRoleDesignation = 'admin' | 'faculty_member' | 'student' | 'unauthenticated'
type Permission =
  | 'view_all_users'
  | 'view_students'
  | 'edit_users'
  | 'delete_users'
  | 'view_dashboard'
  | 'edit_own_profile'

// Expected Response structure from POST /auth/permission
interface PermissionResponse {
  role_designation: UserRoleDesignation
}

const PERMISSIONS_QUERY_KEY = ['userPermissions']

const fetchPermissionsFromBackend = async (): Promise<PermissionResponse> => {
  try {
    // FIX: Send an empty object {} to ensure the backend returns the full role_designation
    const res = await api.post<PermissionResponse>('/auth/permission', {})
    return res.data 
  } catch (error) {
    console.error("Failed to fetch user permissions from /auth/permission:", error)
    return { role_designation: 'unauthenticated' }
  }
}

export function usePermissions() {
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: fetchPermissionsFromBackend,
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  })
  
  const roleDesignation: UserRoleDesignation = (data?.role_designation as UserRoleDesignation) || 'unauthenticated'
  
  const isAdmin = roleDesignation === 'admin'
  const isFacultyMember = roleDesignation === 'faculty_member'

  const contentPermissions = useMemo(() => ({
    // NEW RULE: Subjects (TOS) are Admin-made
    canCreateSubject: isAdmin,               
    // NEW RULE: Modules are Faculty-made
    canCreateModule: isFacultyMember,      
    // Default: Assessments are made by Admin OR Faculty (if rule hasn't changed)
    canCreateAssessment: isFacultyMember, 
    
    // Management: Admin Only (for all content Edit, Delete, Verify)
    canManageContent: isAdmin,             
  }), [isAdmin, isFacultyMember])

  const checkPermission = (permission: Permission | string): boolean => {
      switch (permission) {
          case 'view_all_users':
          case 'edit_users':
          case 'delete_users':
              return isAdmin;
          case 'view_students':
          case 'view_dashboard':
              return isAdmin || isFacultyMember;
          case 'edit_own_profile':
              return true;
          default:
              return false;
      }
  }

  return {
    checkPermission,
    isAdmin, 
    isFaculty: isFacultyMember,
    roleDesignation,
    userRole: roleDesignation, // Resolves routes.tsx error
    isLoading, 
    isError: !!error,
    ...contentPermissions, // Exposes canCreateSubject, canCreateModule, etc.
  }
}