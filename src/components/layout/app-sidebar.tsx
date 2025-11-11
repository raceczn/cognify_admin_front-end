// src/components/layout/app-sidebar.tsx
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { staticSidebarData, getFilteredSidebarData, ROLES } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-store'
import { useMemo } from 'react'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.auth.user)

  // Get filtered sidebar data based on user's role
  const sidebarData = useMemo(() => {
    if (!user?.role_id) {
      // If no user or role_id, return empty sidebar
      return { ...staticSidebarData, navGroups: [] }
    }
    return getFilteredSidebarData(user.role_id)
  }, [user?.role_id])

  // Update team plan text based on role
  const teams = useMemo(() => {
    if (!user?.role_id) return staticSidebarData.teams
    
    const planText = user.role_id === ROLES.ADMIN 
      ? 'Admin View' 
      : 'Faculty View'
    
    return staticSidebarData.teams.map(team => ({
      ...team,
      plan: planText
    }))
  }, [user?.role_id])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}