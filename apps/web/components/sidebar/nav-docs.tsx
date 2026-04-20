'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { cn } from '@/lib/utils'
import { BookOpenIcon } from 'lucide-react'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  const introItem = {
    title: 'Introdução',
    url: '/docs',
    icon: <BookOpenIcon className="h-4 w-4" />,
    items: [],
  }

  const allItems = [introItem, ...(items || [])]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Documentação</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {allItems.map(item => {
          const isActive = pathname === item.url

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className={cn(
                  'transition-colors',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold',
                )}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                  {item.items.map(subItem => {
                    const isSubActive = pathname === subItem.url
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive}
                          className={cn(
                            'transition-colors',
                            isSubActive &&
                              'text-sidebar-accent-foreground font-medium bg-sidebar-accent/50',
                          )}
                        >
                          <Link href={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
