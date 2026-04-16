'use client'

import * as React from 'react'
import { forbidden, useParams, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/page-header'
import { AccessControlForm } from '@/components/form/access-control-form'
import type { AccessControlPayload, Position, Department } from '@/types/access-control'

function EditAccessControlContent() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as 'edit' | 'view') || 'edit'

  const id = params.id
  const type = (searchParams.get('type') as 'position' | 'department') || 'position'

  const { hasPermission, loading, activeAccesses } = useAuth()
  const [options, setOptions] = React.useState<AccessControlPayload | null>(null)
  const [initialData, setInitialData] = React.useState<Position | Department | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Options (Depts, Screens, Perms)
        const optsResponse = await fetch('/api/v1/admin/access-control')
        if (!optsResponse.ok) throw new Error('Falha ao carregar opções')
        const optsResult = await optsResponse.json()
        setOptions(optsResult.data)

        // Fetch Specific Entity Data
        const endpoint =
          type === 'department'
            ? `/api/v1/admin/access-control/departments/${id}`
            : `/api/v1/admin/access-control/positions/${id}`

        const dataResponse = await fetch(endpoint)

        if (dataResponse.status === 404) {
          toast.error(`${type === 'department' ? 'Departamento' : 'Cargo'} não encontrado`)
          router.push('/admin/access-control')
          return
        }

        if (!dataResponse.ok) throw new Error('Falha ao carregar dados do registro')
        const dataResult = await dataResponse.json()
        setInitialData(dataResult.data)
      } catch (error) {
        toast.error('Erro ao carregar dados para edição')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    const canAccess =
      mode === 'view'
        ? hasPermission('access_control', 'view')
        : hasPermission('access_control', 'update')

    if (!loading && canAccess) {
      fetchData()
    }
  }, [loading, hasPermission, id, type, router, mode])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'access_control')?.name || 'Controle de Acesso'
  }, [activeAccesses])

  if (loading) return null

  const canAccess =
    mode === 'view'
      ? hasPermission('access_control', 'view')
      : hasPermission('access_control', 'update')

  if (!canAccess) {
    return forbidden()
  }

  if (isLoadingData || !options || !initialData) {
    return null
  }

  const breadcrumbLabel = type === 'department' ? initialData.name : initialData.name

  return (
    <div className="flex flex-1 flex-col gap-0 p-4 pt-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: screenName, href: '/admin/access-control' },
          {
            label: breadcrumbLabel || `Editar ${type === 'department' ? 'Departamento' : 'Cargo'}`,
          },
        ]}
      />

      <AccessControlForm
        mode={type}
        type="edit"
        initialData={initialData}
        options={options}
        readOnly={mode === 'view'}
        onSuccess={() => router.push('/admin/access-control')}
        onCancel={() => router.push('/admin/access-control')}
      />
    </div>
  )
}

export default function EditAccessControlPage() {
  return (
    <React.Suspense fallback={null}>
      <EditAccessControlContent />
    </React.Suspense>
  )
}
