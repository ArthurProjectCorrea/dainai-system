'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { useFormMode } from '@/hooks/use-form-mode'
import { PageHeader } from '@/components/page-header'
import { ProjectForm } from '@/components/form/project-form'

import type { Project } from '@/types/project'

export default function ProjectDetailsPage() {
  const params = useParams<{ action: string | string[] }>()
  const router = useRouter()
  const { hasPermission, loading } = useAuth()
  const { isCreate, isView } = useFormMode()

  const actionArray = Array.isArray(params.action) ? params.action : [params.action]
  const id = isCreate ? null : actionArray[0]

  const [project, setProject] = React.useState<Project | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(!isCreate)

  const fetchProject = React.useCallback(async () => {
    if (!id || isCreate) return

    try {
      const response = await fetch(`/api/v1/admin/projects/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Projeto não encontrado')
          router.push('/projects')
          return
        }
        throw new Error('Falha ao carregar projeto')
      }
      const result = await response.json()
      setProject(result.data)
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

  if (loading || isLoadingData) return null
  if (!project && !isCreate) return null

  return (
    <div className="flex flex-1 flex-col relative">
      <div className="px-4">
        <PageHeader
          breadcrumbs={[
            { label: 'Projetos', href: '/projects' },
            { label: isCreate ? 'Novo Projeto' : project?.name || 'Carregando...' },
          ]}
        />
      </div>

      <div className="w-full px-4 flex-1 pb-8">
        <ProjectForm
          data={project}
          readOnly={isView}
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
