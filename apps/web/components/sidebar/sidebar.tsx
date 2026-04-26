import * as React from 'react'
import {
  LayoutDashboardIcon,
  ShieldCheckIcon,
  LifeBuoyIcon,
  SendIcon,
  FolderGit2,
  Shredder,
  BookText,
  House,
  Settings2,
} from 'lucide-react'

const name_sidebar: string | undefined = undefined

export type SidebarSubItem = {
  title?: string
  url: string
  name_key?: string
  is_permission?: boolean
}

export type SidebarMainItem = {
  title: string | undefined
  icon: React.ReactNode
  isActive?: boolean
  url?: string
  items?: SidebarSubItem[]
  name_key?: string
  is_permission?: boolean
}

export const sidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      icon: <LayoutDashboardIcon />,
      url: '/dashboard',
    },
    {
      title: name_sidebar,
      icon: <Shredder />,
      url: '/documents',
      name_key: 'documents_management',
      is_permission: true,
    },
    {
      title: name_sidebar,
      icon: <FolderGit2 />,
      url: '/projects',
      name_key: 'projects_management',
      is_permission: true,
    },
    {
      title: 'Administrador',
      icon: <ShieldCheckIcon />,
      isActive: true,
      items: [
        {
          title: name_sidebar,
          url: '/admin/users',
          name_key: 'users_management',
          is_permission: true,
        },
        {
          title: name_sidebar,
          url: '/admin/access-control',
          name_key: 'access_control',
          is_permission: true,
        },

        {
          title: name_sidebar,
          url: '/admin/teams',
          name_key: 'teams_management',
          is_permission: true,
        },
        {
          title: 'Parâmetros',
          url: '/admin/parameters',
          icon: <Settings2 className="w-4 h-4" />,
        },
      ],
    },
  ] as SidebarMainItem[],
  navSecondary: [
    {
      title: 'Área Principal',
      url: '/dashboard',
      icon: <House />,
    },
    {
      title: 'Wiki',
      url: '/wiki',
      icon: <BookText />,
    },
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
