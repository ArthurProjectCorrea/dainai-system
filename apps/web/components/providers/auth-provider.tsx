'use client'

import React, { createContext, useEffect, useState } from 'react'
import { logoutAction } from '@/app/auth/actions'
import { User, UserMeResponse } from '@/types/auth'

type PermissionMap = Record<string, string[]>

interface AuthContextType {
  user: User | null
  loading: boolean
  activeTeamId: string | null
  activeTeamName: string | null
  activePosition: string | null
  activeAccesses: User['teamAccesses'][number]['accesses']
  activePermissionsByScreen: PermissionMap
  setActiveTeam: (teamId: string) => void
  hasPermission: (screen: string, permission?: string) => boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)

  const permissionMapFromAccesses = (
    accesses: User['teamAccesses'][number]['accesses'],
  ): PermissionMap => {
    return accesses.reduce<PermissionMap>((acc, access) => {
      acc[access.nameKey] = access.permissions
      return acc
    }, {})
  }

  const setActiveTeam = (teamId: string) => {
    setActiveTeamId(teamId)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('active_team_id', teamId)
      document.cookie = `active_team_id=${teamId}; path=/; samesite=lax`
    }
  }

  useEffect(() => {
    async function fetchMe() {
      if (window.location.pathname.startsWith('/auth')) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/v1/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const meData: UserMeResponse = await res.json()

        if (!meData.data) {
          setUser(null)
          return
        }

        const normalizedTeams = meData.data.teams.map(team => {
          const teamAny = team as typeof team & {
            IconUrl?: string | null
            LogotipoUrl?: string | null
            Logotipo_Url?: string | null
            logotipo_url?: string | null
            IsActive?: boolean
          }

          return {
            id: team.id,
            name: team.name,
            iconUrl: team.iconUrl ?? teamAny.IconUrl ?? null,
            logotipoUrl:
              team.logotipoUrl ??
              teamAny.logotipo_url ??
              teamAny.LogotipoUrl ??
              teamAny.Logotipo_Url ??
              null,
            isActive: team.isActive ?? teamAny.IsActive ?? true,
          }
        })

        const normalizedTeamAccesses = (meData.data.teamAccesses ?? []).flatMap(teamAccess => {
          const teamAccessAny = teamAccess as typeof teamAccess & {
            TeamId?: string
            Position?: string
            Department?: string
          }

          const teamId = teamAccess.teamId ?? teamAccessAny.TeamId
          if (!teamId) {
            return []
          }

          const normalizedAccessesForTeam = (teamAccess.accesses ?? [])
            .map(access => {
              const accessAny = access as typeof access & {
                NameKey?: string
                Name?: string
                NameSidebar?: string
                Permissions?: string[]
              }

              return {
                nameKey: access.nameKey ?? accessAny.NameKey ?? '',
                name: access.name ?? accessAny.Name ?? '',
                nameSidebar: access.nameSidebar ?? accessAny.NameSidebar ?? '',
                permissions: access.permissions ?? accessAny.Permissions ?? [],
              }
            })
            .filter(access => access.nameKey.length > 0)

          return [
            {
              teamId,
              position: teamAccess.position ?? teamAccessAny.Position ?? 'N/A',
              department: teamAccess.department ?? teamAccessAny.Department ?? 'N/A',
              accesses: normalizedAccessesForTeam,
            },
          ]
        })

        setUser({
          id: meData.data.profile.id,
          email: meData.data.profile.email,
          name: meData.data.profile.name,
          profile: meData.data.profile,
          teams: normalizedTeams,
          teamAccesses: normalizedTeamAccesses,
        })

        const teams = normalizedTeams
        const storedActiveTeamId =
          typeof window !== 'undefined' ? window.localStorage.getItem('active_team_id') : null

        const initialActiveTeamId = teams.some(team => team.id === storedActiveTeamId)
          ? storedActiveTeamId
          : (teams[0]?.id ?? null)

        setActiveTeamId(initialActiveTeamId)

        if (initialActiveTeamId && typeof window !== 'undefined') {
          window.localStorage.setItem('active_team_id', initialActiveTeamId)
          document.cookie = `active_team_id=${initialActiveTeamId}; path=/; samesite=lax`
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(null)
        setActiveTeamId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const logout = async () => {
    await logoutAction()
  }

  const activeTeam = user?.teams.find(team => team.id === activeTeamId) ?? user?.teams[0] ?? null
  const activeTeamAccess = user?.teamAccesses.find(teamAccess => teamAccess.teamId === activeTeamId)

  const activeAccesses = activeTeamAccess?.accesses ?? []
  const activePermissionsByScreen = permissionMapFromAccesses(activeAccesses)

  const hasPermission = (screen: string, permission = 'view') => {
    const permissions = activePermissionsByScreen[screen] ?? []
    return permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeTeamId,
        activeTeamName: activeTeam?.name ?? null,
        activePosition: activeTeamAccess?.position ?? null,
        activeAccesses,
        activePermissionsByScreen,
        setActiveTeam,
        hasPermission,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
