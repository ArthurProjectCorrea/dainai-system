'use client'

import * as React from 'react'
import { forbidden, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFormMode } from '@/hooks/use-form-mode'
import { useAuth } from '@/hooks/use-auth'

import { PageHeader } from '@/components/page-header'
import { DocumentForm } from '@/components/form/document-form'
import { getDocumentByIdAction } from '@/lib/action/document-actions'
import type { Document } from '@/types/document'
import type { Project } from '@/types/project'

function DocumentActionContent() {
  const router = useRouter()
  const params = useParams<{ action: string | string[] }>()
  const { isCreate, isView, readOnly } = useFormMode()
  const { hasPermission, loading, activeAccesses } = useAuth()

  const actionArray = Array.isArray(params.action) ? params.action : [params.action]
  const docId = isCreate ? null : actionArray[0]

  const [document, setDocument] = React.useState<Document | null>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true)

        // Fetch Projects (options)
        const projectsRes = await fetch('/api/v1/admin/projects')
        if (!projectsRes.ok) throw new Error('Falha ao carregar projetos')
        const projectsData = await projectsRes.json()
        setProjects(projectsData.data.projects || [])

        // Fetch Document if edit or view
        if (!isCreate && docId) {
          const docRes = await getDocumentByIdAction(docId)
          if (docRes.error) {
            toast.error('Documento não encontrado')
            router.push('/documents')
            return
          }
          setDocument(docRes.data || null)
        }
      } catch (error) {
        toast.error('Erro ao carregar dados da página')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    const canAccess = readOnly
      ? hasPermission('documents_management', 'view')
      : isCreate
        ? hasPermission('documents_management', 'create')
        : hasPermission('documents_management', 'update')

    if (!loading && canAccess) {
      loadData()
    }
  }, [loading, hasPermission, docId, router, readOnly, isCreate])

  const refreshData = async () => {
    if (!isCreate && docId) {
      const docRes = await getDocumentByIdAction(docId)
      if (docRes.data) {
        setDocument(docRes.data)
      }
    }
  }

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'documents_management')?.name || 'Documentos'
  }, [activeAccesses])

  if (loading) return null

  const canAccess = readOnly
    ? hasPermission('documents_management', 'view')
    : isCreate
      ? hasPermission('documents_management', 'create')
      : hasPermission('documents_management', 'update')

  if (!canAccess) {
    return forbidden()
  }

  if (isLoadingData) {
    return null // Could be a skeleton
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: screenName, href: '/documents' },
          {
            label: isCreate
              ? 'Novo Documento'
              : document?.name || (isView ? 'Visualizar' : 'Editar'),
          },
        ]}
      />

      <div className="flex flex-1 flex-col gap-0 p-4 pt-0">
        <DocumentForm
          mode={isCreate ? 'create' : isView ? 'view' : 'edit'}
          initialData={document}
          projects={projects}
          canApprove={hasPermission('documents_management', 'approve')}
          onSuccess={refreshData}
          onCancel={() => router.push('/documents')}
          onEdit={
            hasPermission('documents_management', 'update')
              ? () => router.push(`/documents/${docId}/edit`)
              : undefined
          }
        />
      </div>
    </div>
  )
}

export default function DocumentActionPage() {
  return (
    <React.Suspense fallback={null}>
      <DocumentActionContent />
    </React.Suspense>
  )
}
