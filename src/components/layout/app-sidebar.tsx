'use client'

import { useEffect, useState } from 'react'
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
import { getProfile } from '@/lib/profile-hooks'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()

  // You can still fetch user data here if needed for other purposes,
  // but it’s no longer passed to NavUser.
  const [, setUser] = useState({
    name: 'Loading...',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = localStorage.getItem('uid')
        if (!uid) return
        const data = await getProfile(uid)
        setUser({
          name: data.nickname || data.first_name || 'Administrator',
          email: data.email || 'n/a',
          avatar: data.avatar || '/avatars/shadcn.jpg',
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    fetchProfile()
  }, [])

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
        {/* ❌ remove user prop, NavUser handles it internally */}
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
