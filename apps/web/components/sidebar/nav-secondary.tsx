'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { FeedbackDialog } from '@/components/dialog/feedback-dialog'

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { setOpenMobile } = useSidebar()
  const [feedbackOpen, setFeedbackOpen] = React.useState(false)
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent, title: string) => {
    if (title === 'Feedback') {
      e.preventDefault()
      setFeedbackOpen(true)
    }
  }

  // Filtrar itens baseados no contexto atual para evitar redundância
  // Se estiver em /wiki, não mostrar o link para /wiki, mostrar para /dashboard
  // Se NÃO estiver em /wiki, mostrar o link para /wiki, não mostrar para /dashboard (Area Principal)
  const isWikiPath = pathname?.startsWith('/wiki')

  const filteredItems = items.filter(item => {
    if (isWikiPath) {
      // Na Wiki, removemos o link de Wiki e mantemos Area Principal
      return item.url !== '/wiki'
    } else {
      // No Dashboard/App, removemos Area Principal e mantemos Wiki
      return item.url !== '/dashboard'
    }
  })

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link
                  href={item.url}
                  onClick={e => {
                    handleClick(e, item.title)
                    setOpenMobile(false)
                  }}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </SidebarGroup>
  )
}
