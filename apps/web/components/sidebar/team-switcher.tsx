'use client'

import * as React from 'react'
import Image from 'next/image'
import { Building2, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { Team } from '@/types/team'

export function TeamSwitcher({
  teams,
  activeTeamId,
  onTeamChange,
  loading = false,
}: {
  teams: (Team & { position: string })[]
  activeTeamId: string | null
  onTeamChange: (teamId: string) => void
  loading?: boolean
}) {
  const { isMobile } = useSidebar()
  const activeTeam = teams.find(team => team.id === activeTeamId) ?? teams[0]
  const [logoError, setLogoError] = React.useState(false)
  const teamLogo = activeTeam?.logotipoUrl ?? null

  React.useEffect(() => {
    setLogoError(false)
  }, [teamLogo])

  if (loading || !activeTeam) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {teamLogo && !logoError ? (
                  <Image
                    src={teamLogo}
                    alt={activeTeam.name}
                    width={32}
                    height={32}
                    unoptimized
                    className="size-8 rounded-lg object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.position}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Times</DropdownMenuLabel>

            {teams.map((team, index) => {
              const teamLogoItem = team.logotipoUrl ?? null

              return (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => team.isActive && onTeamChange(team.id)}
                  disabled={!team.isActive}
                  className={cn('gap-2 p-2', !team.isActive && 'opacity-60 cursor-not-allowed')}
                >
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border">
                    {teamLogoItem ? (
                      <Image
                        src={teamLogoItem}
                        alt={team.name}
                        width={24}
                        height={24}
                        unoptimized
                        className={cn('size-6 object-cover', !team.isActive && 'grayscale')}
                      />
                    ) : (
                      <Building2 className="size-3.5 shrink-0" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{team.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {team.isActive ? team.position : 'Inativo'}
                    </span>
                  </div>
                  <div className="ml-auto">
                    {activeTeamId === team.id && <Check className="size-4 text-emerald-500" />}
                    {!team.isActive && (
                      <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                        Inativo
                      </span>
                    )}
                    {activeTeamId !== team.id && team.isActive && (
                      <DropdownMenuShortcut className="ml-0">
                        {`Ctrl+${index + 1}`}
                      </DropdownMenuShortcut>
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
