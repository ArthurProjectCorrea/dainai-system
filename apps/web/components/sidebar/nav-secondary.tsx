'use client'

import * as React from 'react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { FeedbackDialog } from '@/components/feedback-dialog'

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
  const [feedbackOpen, setFeedbackOpen] = React.useState(false)

  const handleClick = (e: React.MouseEvent, title: string) => {
    if (title === 'Feedback') {
      e.preventDefault()
      setFeedbackOpen(true)
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url} onClick={e => handleClick(e, item.title)}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </SidebarGroup>
  )
}
