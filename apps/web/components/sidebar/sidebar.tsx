import * as React from 'react'
import { LayoutDashboardIcon, ShieldCheckIcon, LifeBuoyIcon, SendIcon } from 'lucide-react'

const name_sidebar: string | undefined = undefined

export type SidebarSubItem = {
  title?: string
  url: string
  name_key?: string
  is_permission?: boolean
}

export type SidebarMainItem = {
  title: string
  icon: React.ReactNode
  isActive?: boolean
  url?: string
  items?: SidebarSubItem[]
}

export const sidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      icon: <LayoutDashboardIcon />,
      url: '/dashboard',
    },
    {
      title: 'Administrador',
      icon: <ShieldCheckIcon />,
      isActive: true,
      items: [
        {
          title: name_sidebar,
          url: '/admin/access-control',
          name_key: 'access_control',
          is_permission: true,
        },
        {
          title: name_sidebar,
          url: '/admin/users',
          name_key: 'users_management',
          is_permission: true,
        },
        {
          title: name_sidebar,
          url: '/admin/teams',
          name_key: 'teams_management',
          is_permission: true,
        },
      ],
    },
  ] as SidebarMainItem[],
  navSecondary: [
    {
      title: 'Suporte',
      url: '#',
      icon: <LifeBuoyIcon />,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: <SendIcon />,
    },
  ],
}
