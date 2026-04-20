'use client'

import * as React from 'react'
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
  SidebarMenuAction,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookOpenIcon, ChevronRight, MoreHorizontal, FileTextIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { SidebarGroup as SidebarGroupConfig } from '@/types/project'

interface NavDocsProps {
  sidebarConfig?: SidebarGroupConfig[]
}

const DynamicIcon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return <FileTextIcon className={className} />
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >
  const IconComponent = icons[name] || FileTextIcon
  return <IconComponent className={className} />
}

export function NavMain({ sidebarConfig = [] }: NavDocsProps) {
  const pathname = usePathname()

  const introItem = {
    title: 'Introdução',
    url: '/docs',
    icon: <BookOpenIcon className="h-4 w-4" />,
  }

  // Se não houver configuração, renderizamos a introdução básica
  if (!sidebarConfig || sidebarConfig.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Documentação</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === introItem.url}>
              <Link href={introItem.url}>
                {introItem.icon}
                <span>{introItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <>
      {/* Ítem fixo de Introdução no topo */}
      <SidebarGroup className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === introItem.url}>
              <Link href={introItem.url}>
                {introItem.icon}
                <span>{introItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {sidebarConfig.map(group => {
        // Renderização para Tipo SOLO
        if (group.type === 'Solo') {
          return (
            <SidebarGroup key={group.id} className="py-1">
              <SidebarMenu>
                {group.items.map(item => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/docs/${item.documentId}`}
                      tooltip={group.title || item.documentName}
                    >
                      <Link href={`/docs/${item.documentId}`}>
                        <DynamicIcon name={group.icon} className="h-4 w-4" />
                        <span>{group.title || item.documentName}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        }

        // Renderização para Tipo LISTA
        if (group.type === 'List') {
          return (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel className="flex items-center gap-2">
                <DynamicIcon name={group.icon} className="h-3 w-3 opacity-70" />
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(item => {
                    const url = `/docs/${item.documentId}`
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={pathname === url}>
                          <Link href={url}>
                            <span>{item.documentName}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        }

        // Renderização para Tipo COLLAPSE (Dropdown ARVORE)
        if (group.type === 'Collapse') {
          const isAnyActive = group.items.some(i => pathname === `/docs/${i.documentId}`)

          return (
            <SidebarGroup key={group.id} className="py-1">
              <SidebarMenu>
                <Collapsible asChild defaultOpen={isAnyActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={group.title}>
                        <DynamicIcon name={group.icon} className="h-4 w-4" />
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                        {group.items.map(item => {
                          const url = `/docs/${item.documentId}`
                          return (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton asChild isActive={pathname === url}>
                                <Link href={url}>
                                  <span>{item.documentName}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>
          )
        }

        // Renderização para Tipo DROPDOWN (Menu de Ações)
        if (group.type === 'Dropdown') {
          return (
            <SidebarGroup key={group.id} className="py-1">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={group.title}>
                    <DynamicIcon name={group.icon} className="h-4 w-4" />
                    <span>{group.title}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">Opções</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-lg" side="right" align="start">
                      {group.items.map(item => (
                        <DropdownMenuItem key={item.id} asChild>
                          <Link
                            href={`/docs/${item.documentId}`}
                            className="flex items-center gap-2"
                          >
                            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{item.documentName}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )
        }

        return null
      })}
    </>
  )
}
