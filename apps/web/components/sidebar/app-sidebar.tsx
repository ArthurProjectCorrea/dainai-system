'use client'

import * as React from 'react'

import { NavMain } from '@/components/sidebar/nav-main'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import { TeamSwitcher } from '@/components/sidebar/team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'
import { sidebarData, type SidebarMainItem } from '@/components/sidebar/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading, hasPermission, activeTeamId, setActiveTeam, activeAccesses } = useAuth()

  const teamsForSwitcher = React.useMemo(() => {
    const teamContextById = new Map(
      (user?.teamAccesses ?? []).map(teamAccess => [teamAccess.teamId, teamAccess]),
    )

    return (user?.teams ?? []).map(team => ({
      id: team.id,
      name: team.name,
      iconUrl: team.iconUrl,
      position: teamContextById.get(team.id)?.position ?? 'Sem cargo',
      logotipoUrl: team.logotipoUrl ?? null,
      isActive: team.isActive,
    }))
  }, [user?.teamAccesses, user?.teams])

  const navMainItems = React.useMemo(() => {
    const accessTitleByScreen = new Map(
      activeAccesses.map(access => [access.nameKey, access.nameSidebar.trim()]),
    )

    const resolvedItems: SidebarMainItem[] = sidebarData.navMain
      .map(item => {
        if (!item.items?.length) {
          return item
        }

        const allowedSubItems = item.items
          .filter(subItem => {
            if (subItem.is_permission !== true) {
              return true
            }

            if (!subItem.name_key) {
              return false
            }

            return hasPermission(subItem.name_key, 'view')
          })
          .map(subItem => {
            const dbTitle = subItem.name_key ? accessTitleByScreen.get(subItem.name_key) : undefined

            return {
              ...subItem,
              title: dbTitle || subItem.title || 'Sem nome',
            }
          })

        if (allowedSubItems.length === 0) {
          return null
        }

        return {
          ...item,
          items: allowedSubItems,
        }
      })
      .filter((item): item is SidebarMainItem => item !== null)

    return resolvedItems
  }, [activeAccesses, hasPermission])

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={teamsForSwitcher}
          activeTeamId={activeTeamId}
          onTeamChange={setActiveTeam}
          loading={loading}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
