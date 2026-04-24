'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { cn } from '@/lib/utils'

import { NavWiki } from '@/components/sidebar/nav-wiki'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import { ProjectSwitcher } from '@/components/sidebar/project-switcher'
import { TeamSwitcher } from '@/components/sidebar/team-switcher'
import { getWikiNavigationAction } from '@/lib/action/document-action'
import { useAuth } from '@/hooks/use-auth'
import { Project } from '@/types'
import { Document } from '@/types'
import { sidebarData } from '@/components/sidebar/sidebar'
import { toast } from 'sonner'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'

import { useWiki } from '@/context/wiki-context'

export function WikiSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { user, activeTeamId, setActiveTeam } = useAuth()
  const { activeProjectId, setActiveProjectId } = useWiki()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    async function fetchData() {
      if (projects.length === 0) setLoading(true)
      const { data, error } = await getWikiNavigationAction()

      if (error) {
        toast.error(error)
        setLoading(false)
        return
      }

      if (data) {
        setProjects(data.projects)
        setDocuments(data.documents)

        // Filtrar projetos do time ativo para sincronização
        const teamProjects = data.projects.filter(p => p.teamId === activeTeamId)

        // Sincronizar activeProjectId:
        if (teamProjects.length > 0) {
          const currentIsValid = teamProjects.some(p => p.id === activeProjectId)
          if (!currentIsValid) {
            setActiveProjectId(teamProjects[0].id)
          }
        } else {
          setActiveProjectId(null)
        }
      }
      setLoading(false)
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId]) // Only re-fetch when the active team changes

  const handleTeamChange = (teamId: string) => {
    startTransition(() => {
      setActiveTeam(teamId)
      router.push('/wiki')
      router.refresh()
    })
  }

  const handleProjectChange = (projectId: string) => {
    startTransition(() => {
      setActiveProjectId(projectId)
      router.push('/wiki')
    })
  }

  // Mapear times para o switcher
  const teamsForSwitcher = React.useMemo(() => {
    const teamContextById = new Map(
      (user?.teamAccesses ?? []).map(teamAccess => [teamAccess.teamId, teamAccess]),
    )

    return (user?.teams ?? []).map(team => ({
      id: team.id,
      name: team.name,
      position: teamContextById.get(team.id)?.position ?? 'Sem cargo',
      isActive: team.isActive,
    }))
  }, [user?.teamAccesses, user?.teams])

  // Mapear projetos para o formato que o Switcher espera - FILTRADO POR TIME
  const projectsForSwitcher = projects
    .filter(p => p.teamId === activeTeamId)
    .map(p => ({
      id: p.id,
      name: p.name,
      isActive: p.isActive,
      teamName: p.teamName,
    }))

  // Fallback: Se não houver configuração de sidebar mas houver documentos,
  // criamos um grupo padrão "Documentos" para manter a retrocompatibilidade
  // e garantir que o usuário veja algo.
  const finalSidebarConfig = React.useMemo(() => {
    // Obter a configuração da sidebar do projeto ativo
    const activeProject = projects.find(p => p.id === activeProjectId)
    const sidebarConfig = activeProject?.sidebarConfig || []

    if (sidebarConfig.length > 0) return sidebarConfig

    const projectDocs = documents.filter(doc => doc.projectId === activeProjectId)
    if (projectDocs.length === 0) return []

    return [
      {
        id: 'fallback-group',
        title: 'Documentos',
        type: 'List' as const,
        order: 0,
        items: projectDocs.map((doc, index) => ({
          id: doc.id,
          documentId: doc.id,
          documentName: doc.name,
          order: index,
        })),
      },
    ]
  }, [projects, documents, activeProjectId])

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader
        className={cn('gap-2 transition-opacity duration-300', isPending && 'opacity-50')}
      >
        {(loading || teamsForSwitcher.length >= 1) && (
          <TeamSwitcher
            teams={teamsForSwitcher}
            activeTeamId={activeTeamId}
            onTeamChange={handleTeamChange}
            loading={loading}
          />
        )}
        {(loading || projectsForSwitcher.length >= 1) && (
          <ProjectSwitcher
            teams={projectsForSwitcher}
            activeTeamId={activeProjectId}
            onTeamChange={handleProjectChange}
            loading={loading}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavWiki sidebarConfig={finalSidebarConfig} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
