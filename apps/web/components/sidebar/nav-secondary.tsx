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
  // Se estiver em /docs, não mostrar o link para /docs, mostrar para /dashboard
  // Se NÃO estiver em /docs, mostrar o link para /docs, não mostrar para /dashboard (Area Principal)
  const isDocsPath = pathname?.startsWith('/docs')

  const filteredItems = items.filter(item => {
    if (isDocsPath) {
      // No Docs, removemos o link de Documentação e mantemos Area Principal
      return item.url !== '/docs'
    } else {
      // No Dashboard, removemos Area Principal e mantemos Documentação
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
