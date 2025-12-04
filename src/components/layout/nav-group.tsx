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

export function NavGroup({ title, items }: NavGroupType) {
  // [FIX] Get both pathname and search string
  const { pathname, search } = useLocation()
  
  // Combine them to form the current full path (e.g., "/admin/verification?type=module")
  // We use decodeURIComponent to handle any encoding issues if necessary, 
  // but usually strict string comparison works for simple params.
  const currentUrl = pathname + (search.toString() !== '{}' ? `?${new URLSearchParams(search as any).toString()}` : '')

  // Helper to check if a URL is active
  // We check for exact match to prevent "All Pending" from highlighting when "Modules" is selected
  const isUrlActive = (url: string) => {
    // Normalize by removing trailing slash if present
    const cleanCurrent = currentUrl.replace(/\/$/, '')
    const cleanUrl = url.replace(/\/$/, '')
    
    // 1. Exact match (Best for distinct tabs like ?type=module)
    if (cleanCurrent === cleanUrl) return true
    
    // 2. Fallback: If we are on "/admin/verification" (no params), ensure we match the "All Pending" link which has no params
    if (cleanUrl === '/admin/verification' && cleanCurrent === '/admin/verification') return true

    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isCollapsible = item.items && item.items.length > 0

          if (isCollapsible) {
             // Keep group open if ANY child is active
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
                       {item.icon && <item.icon />}
                       <span>{item.title}</span>
                       <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                     </SidebarMenuButton>
                   </CollapsibleTrigger>
                   <CollapsibleContent>
                     <SidebarMenuSub>
                       {item.items?.map((subItem) => (
                         <SidebarMenuSubItem key={subItem.title}>
                           {/* [FIX] Use new isUrlActive helper */}
                           <SidebarMenuSubButton asChild isActive={isUrlActive(subItem.url ?? '')}>
                             <Link to={subItem.url ?? ''}>
                               <span>{subItem.title}</span>
                             </Link>
                           </SidebarMenuSubButton>
                         </SidebarMenuSubItem>
                       ))}
                     </SidebarMenuSub>
                   </CollapsibleContent>
                 </SidebarMenuItem>
               </Collapsible>
             )
          }

          return (
            <SidebarMenuItem key={item.title}>
              {/* [FIX] Use new isUrlActive helper */}
              <SidebarMenuButton asChild isActive={isUrlActive(item.url ?? '')} tooltip={item.title}>
                <Link to={item.url ?? ''}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
