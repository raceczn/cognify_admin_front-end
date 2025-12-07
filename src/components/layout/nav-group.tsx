import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Link, useLocation } from '@tanstack/react-router'
import { type NavGroup as NavGroupType } from './types'
import { useVerificationQueue, useWhitelist } from '@/lib/admin-hooks'

export function NavGroup({ title, items }: NavGroupType) {
  const { pathname, search } = useLocation()
  
  // Fetch data for badges
  const { data: queue } = useVerificationQueue()
  const { data: whitelist } = useWhitelist()

  // Helper to calculate badge count based on URL
  const getBadgeCount = (url: string) => {
    // Optimization: Only check badges for the "General" group
    if (title !== 'General') return null
    
    // Normalize URL
    const cleanUrl = url.split('?')[0]
    const searchParams = new URLSearchParams(url.split('?')[1])
    const type = searchParams.get('type')

    // --- 1. Verification Queue Badges ---
    if (cleanUrl === '/admin/verification') {
        if (!queue) return null
        
        // Parent item / All Pending
        if (!type) {
            return queue.length > 0 ? queue.length : null
        }
        
        // Sub-items (Modules, Assessments, Subjects)
        const count = queue.filter(i => i.type === type).length
        return count > 0 ? count : null
    }

    // --- 2. Whitelisting Badge ---
    // Shows count of users who are whitelisted but haven't registered yet
    if (cleanUrl === '/admin/whitelisting' && whitelist) {
        const pendingCount = whitelist.filter((u: any) => !u.is_registered).length
        return pendingCount > 0 ? pendingCount : null
    }
    
    return null
  }

  const currentUrl = pathname + (search.toString() !== '{}' ? `?${new URLSearchParams(search as any).toString()}` : '')

  const isUrlActive = (url: string) => {
    const cleanCurrent = currentUrl.replace(/\/$/, '')
    const cleanUrl = url.replace(/\/$/, '')
    
    if (cleanCurrent === cleanUrl) return true
    
    // Parent matching for verification root
    if (cleanUrl === '/admin/verification' && cleanCurrent === '/admin/verification') return true

    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isCollapsible = item.items && item.items.length > 0
          
          // Calculate parent badge (sum of child badges or specific logic)
          // For Verification, it's the total queue length
          const parentBadge = item.title === 'Verification' && queue && queue.length > 0 
            ? queue.length 
            : getBadgeCount(item.url ?? '') // Fallback for non-verification parents

          if (isCollapsible) {
             const isChildActive = item.items?.some(sub => isUrlActive(sub.url ?? ''))

             return (
               <Collapsible
                 key={item.title}
                 asChild
                 defaultOpen={isChildActive}
                 className="group/collapsible"
               >
                 <SidebarMenuItem>
                   <CollapsibleTrigger asChild>
                     <SidebarMenuButton tooltip={item.title}>
                       {item.icon && <item.icon className="!size-5" />}
                       <span>{item.title}</span>
                       
                       {/* Render Parent Badge */}
                       {parentBadge && (
                         <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                           {parentBadge}
                         </span>
                       )}

                       <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                     </SidebarMenuButton>
                   </CollapsibleTrigger>
                   <CollapsibleContent>
                     <SidebarMenuSub>
                       {item.items?.map((subItem) => {
                         const count = getBadgeCount(subItem.url ?? '')
                         
                         return (
                           <SidebarMenuSubItem key={subItem.title}>
                             <SidebarMenuSubButton asChild isActive={isUrlActive(subItem.url ?? '')}>
                               <Link to={subItem.url ?? ''} className="flex w-full items-center justify-between pr-2">
                                 <span>{subItem.title}</span>
                                 {/* Render Sub-Item Badge */}
                                 {count && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">
                                      {count}
                                    </span>
                                 )}
                               </Link>
                             </SidebarMenuSubButton>
                           </SidebarMenuSubItem>
                         )
                       })}
                     </SidebarMenuSub>
                   </CollapsibleContent>
                 </SidebarMenuItem>
               </Collapsible>
             )
          }

          // Non-collapsible items (e.g. Dashboard, User List, Whitelisting)
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isUrlActive(item.url ?? '')} tooltip={item.title}>
                <Link to={item.url ?? ''} className="flex w-full items-center justify-between pr-2">
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="!size-5" />}
                    <span>{item.title}</span>
                  </div>
                  
                  {/* Render Badge (Specifically handles Whitelisting here) */}
                  {getBadgeCount(item.url ?? '') && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {getBadgeCount(item.url ?? '')}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}