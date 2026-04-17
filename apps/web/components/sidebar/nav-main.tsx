'use client'

import * as React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { type SidebarMainItem } from '@/components/sidebar/sidebar'

export function NavMain({ items }: { items: SidebarMainItem[] }) {
  const { state, toggleSidebar } = useSidebar()
  const [openGroup, setOpenGroup] = React.useState<string | null>(() => {
    const activeGroupedItem = items.find(item => item.items?.length && item.isActive)
    return activeGroupedItem ? (activeGroupedItem.url ?? activeGroupedItem.title ?? null) : null
  })

  const openGroupedItem = (itemKey: string | null) => {
    setOpenGroup(itemKey)
    if (state === 'collapsed') {
      toggleSidebar()
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Geral</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item =>
          (() => {
            const itemKey = item.url ?? item.title ?? null
            const hasChildren = Boolean(item.items?.length)
            const isOpen = hasChildren && openGroup === itemKey

            if (item.url) {
              return (
                <Collapsible
                  key={itemKey}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            if (hasChildren) {
              return (
                <Collapsible
                  key={itemKey}
                  asChild
                  open={isOpen}
                  onOpenChange={open => setOpenGroup(open ? itemKey : null)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {state === 'collapsed' ? (
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => openGroupedItem(itemKey)}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                        <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    ) : (
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon}
                          <span>{item.title}</span>
                          <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    )}
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map(subItem => (
                          <SidebarMenuSubItem key={subItem.url}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
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
              <Collapsible
                key={itemKey}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Collapsible>
            )
          })(),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
