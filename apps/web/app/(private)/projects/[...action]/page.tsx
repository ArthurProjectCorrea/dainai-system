'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { useFormMode } from '@/hooks/use-form-mode'
import { PageHeader } from '@/components/page-header'
import { ProjectForm } from '@/components/form/project-form'
import { getProjectByIdAction } from '@/lib/action/project-actions'
import type { Project } from '@/types/project'

export default function ProjectDetailsPage() {
  const params = useParams<{ action: string | string[] }>()
  const router = useRouter()
  const { hasPermission, loading, activeAccesses } = useAuth()
  const { isCreate, isView } = useFormMode()

  const actionArray = Array.isArray(params.action) ? params.action : [params.action]
  const id = isCreate ? null : actionArray[0]

  const [project, setProject] = React.useState<Project | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(!isCreate)

  const fetchProject = React.useCallback(async () => {
    if (!id || isCreate) return

    try {
      const result = await getProjectByIdAction(id)

      if (result.error) {
        toast.error(result.error)
        router.push('/projects')
        return
      }

      setProject(result.data || null)
    } catch (error) {
      toast.error('Erro ao buscar dados')
      console.error(error)
    } finally {
      setIsLoadingData(false)
    }
  }, [id, isCreate, router])

  React.useEffect(() => {
    if (!loading && hasPermission('projects_management', 'view')) {
      fetchProject()
    }
  }, [loading, hasPermission, fetchProject])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'projects_management')?.name || 'Projetos'
  }, [activeAccesses])

  if (loading || isLoadingData) return null
  if (!project && !isCreate) return null

  return (
    <div className="flex flex-1 flex-col relative">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: screenName, href: '/projects' },
          {
            label: isCreate ? 'Novo Projeto' : project?.name || (isView ? 'Visualizar' : 'Editar'),
          },
        ]}
      />

      <div className="w-full px-4 flex-1 pb-8 pt-2">
        <ProjectForm
          data={project}
          readOnly={isView}
          onEdit={
            hasPermission('projects_management', 'update')
              ? () => router.push(`/projects/${id}/edit`)
              : undefined
          }
          onSuccess={() => {
            if (isCreate) router.push('/projects')
            else fetchProject()
          }}
          onCancel={() => router.push('/projects')}
        />
      </div>
    </div>
  )
}
