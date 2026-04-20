'use client'

import * as React from 'react'
import { FolderGit2, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/kbd'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectSwitcher({
  teams,
  activeTeamId,
  onTeamChange,
  loading = false,
}: {
  teams: {
    id: string
    name: string
    isActive: boolean
    teamName: string
  }[]
  activeTeamId: string | null
  onTeamChange: (teamId: string) => void
  loading?: boolean
}) {
  const { isMobile } = useSidebar()
  const activeTeam = teams.find(team => team.id === activeTeamId) ?? teams[0]

  if (loading) {
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

  if (!activeTeam) return null

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
                <FolderGit2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.teamName}</span>
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
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Projetos
            </DropdownMenuLabel>

            {teams.map((team, index) => {
              return (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => team.isActive && onTeamChange(team.id)}
                  disabled={!team.isActive}
                  className={cn('gap-2 p-2', !team.isActive && 'opacity-60 cursor-not-allowed')}
                >
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border">
                    <FolderGit2 className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-1 min-w-0 flex-col">
                    <span className="truncate font-medium">{team.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {team.isActive ? team.teamName : 'Inativo'}
                    </span>
                  </div>
                  <div className="ml-auto">
                    {activeTeamId === team.id && <Check className="size-4 text-emerald-500" />}
                    {!team.isActive && (
                      <span className="text-xs uppercase tracking-wider text-amber-500 font-bold">
                        Inativo
                      </span>
                    )}
                    {activeTeamId !== team.id && team.isActive && (
                      <Kbd className="ml-auto bg-transparent border-none text-muted-foreground/50">
                        {`Ctrl+${index + 1}`}
                      </Kbd>
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
