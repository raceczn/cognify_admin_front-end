import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { staticSidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
// --- FIX: Removed getProfile, it's not needed here ---

export function AppSidebar() {
  const { collapsible, variant } = useLayout()

  // --- FIX: Removed the entire useEffect and useState for profile ---
  // NavUser now gets all its info directly from the auth store,
  // which was populated correctly at login.

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={staticSidebarData.teams} />
      </SidebarHeader>

      <SidebarContent>
        {staticSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* NavUser handles its own state internally from the auth store */}
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
