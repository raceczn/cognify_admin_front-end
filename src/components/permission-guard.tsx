import { type ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'

type PermissionGuardProps = {
  permission: Parameters<
    ReturnType<typeof usePermissions>['checkPermission']
  >[0]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { checkPermission } = usePermissions()

  if (!checkPermission(permission)) {
    return fallback
  }

  return children
}
