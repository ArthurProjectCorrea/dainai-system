'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { NavMain } from '@/components/sidebar/nav-docs'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import { TeamSwitcher } from '@/components/sidebar/project-switcher'
import { getDocsNavigationAction } from '@/lib/action/document-actions'
import { useAuth } from '@/hooks/use-auth'
import { Project } from '@/types/project'
import { Document } from '@/types/document'
import { sidebarData } from '@/components/sidebar/sidebar'
import { toast } from 'sonner'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'
import { FileTextIcon } from 'lucide-react'

import { useDocs } from '@/context/docs-context'

export function DocsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { activeTeamId } = useAuth()
  const { activeProjectId, setActiveProjectId } = useDocs()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await getDocsNavigationAction()

      if (error) {
        toast.error(error)
        setLoading(false)
        return
      }

      if (data) {
        setProjects(data.projects)
        setDocuments(data.documents)

        // Sincronizar activeProjectId: prioriza o que já existe no contexto, senão pega o primeiro
        if (data.projects.length > 0) {
          const currentExists = data.projects.some(p => p.id === activeProjectId)
          if (!currentExists) {
            setActiveProjectId(data.projects[0].id)
          }
        } else {
          setActiveProjectId(null)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [activeTeamId, activeProjectId, setActiveProjectId]) // Recarregar se o time ou projeto mudar

  const handleProjectChange = (projectId: string) => {
    setActiveProjectId(projectId)
    router.push('/docs')
  }

  // Mapear projetos para o formato que o Switcher espera
  const projectsForSwitcher = projects.map(p => ({
    id: p.id,
    name: p.name,
    isActive: p.isActive,
    teamName: p.teamName,
  }))

  // Filtrar documentos pelo projeto selecionado
  const filteredDocs = documents
    .filter(doc => doc.projectId === activeProjectId)
    .map(doc => ({
      title: doc.name,
      url: `/docs/${doc.id}`,
      icon: <FileTextIcon className="h-4 w-4" />,
    }))

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={projectsForSwitcher}
          activeTeamId={activeProjectId}
          onTeamChange={handleProjectChange}
          loading={loading}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredDocs} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
