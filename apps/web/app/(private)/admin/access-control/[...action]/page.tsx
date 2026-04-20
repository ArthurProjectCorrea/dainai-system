'use client'

import * as React from 'react'
import { forbidden, useParams, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { useFormMode } from '@/hooks/use-form-mode'
import { PageHeader } from '@/components/page-header'
import { AccessControlForm } from '@/components/form/access-control-form'
import {
  getAccessControlDataAction,
  getDepartmentByIdAction,
  getPositionByIdAction,
} from '@/lib/action/access-control-actions'
import type { AccessControlPayload, Position, Department } from '@/types/access-control'

function EditAccessControlContent() {
  const router = useRouter()
  // With catch-all route, params.action is an array like ['12'] or ['12', 'view']
  const params = useParams<{ action: string | string[] }>()
  const searchParams = useSearchParams()

  const { isCreate, readOnly } = useFormMode()

  // Extract id safely
  const actionArray = Array.isArray(params.action) ? params.action : [params.action]
  const id = isCreate ? null : actionArray[0]

  const type = (searchParams.get('type') as 'position' | 'department') || 'position'

  const { hasPermission, loading, activeAccesses } = useAuth()
  const [options, setOptions] = React.useState<AccessControlPayload | null>(null)
  const [initialData, setInitialData] = React.useState<Position | Department | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const optsResult = await getAccessControlDataAction()
        if (optsResult.error) throw new Error(optsResult.error)
        setOptions(optsResult.data!)

        if (!isCreate && id) {
          const result =
            type === 'department'
              ? await getDepartmentByIdAction(id)
              : await getPositionByIdAction(id)

          if (result.error) {
            toast.error(result.error)
            router.push('/admin/access-control')
            return
          }

          setInitialData(result.data || null)
        }
      } catch (error) {
        toast.error('Erro ao carregar dados')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    const canAccess = readOnly
      ? hasPermission('access_control', 'view')
      : isCreate
        ? hasPermission('access_control', 'create')
        : hasPermission('access_control', 'update')

    if (!loading && canAccess) {
      fetchData()
    }
  }, [loading, hasPermission, id, type, router, readOnly, isCreate])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'access_control')?.name || 'Controle de Acesso'
  }, [activeAccesses])

  if (loading) return null

  const canAccessSync = readOnly
    ? hasPermission('access_control', 'view')
    : isCreate
      ? hasPermission('access_control', 'create')
      : hasPermission('access_control', 'update')

  if (!canAccessSync) {
    return forbidden()
  }

  if (isLoadingData || !options || (!isCreate && !initialData)) {
    return null
  }

  const breadcrumbLabel = isCreate
    ? `Novo ${type === 'department' ? 'Departamento' : 'Cargo'}`
    : initialData?.name || `Editar ${type === 'department' ? 'Departamento' : 'Cargo'}`

  return (
    <div className="flex flex-1 flex-col gap-0 p-4 pt-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: screenName, href: '/admin/access-control' },
          {
            label: breadcrumbLabel,
          },
        ]}
      />

      <AccessControlForm
        mode={type}
        type={isCreate ? 'create' : 'edit'}
        initialData={initialData || undefined}
        options={options}
        readOnly={readOnly}
        onSuccess={() => router.push('/admin/access-control')}
        onCancel={() => router.push('/admin/access-control')}
        onEdit={
          hasPermission('access_control', 'update')
            ? () => router.push(`/admin/access-control/${id}/edit?type=${type}`)
            : undefined
        }
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
