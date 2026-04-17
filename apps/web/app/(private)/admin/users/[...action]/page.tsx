'use client'

import * as React from 'react'
import { forbidden, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFormMode } from '@/hooks/use-form-mode'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/page-header'
import { UserForm } from '@/components/form/user-form'

import type { UserDetailPayload } from '@/types/user'

function EditUserContent() {
  const router = useRouter()
  const params = useParams<{ action: string | string[] }>()
  const { isCreate, readOnly } = useFormMode()

  const actionArray = Array.isArray(params.action) ? params.action : [params.action]
  const userId = isCreate ? null : actionArray[0]

  const { hasPermission, loading, activeAccesses } = useAuth()
  const [payload, setPayload] = React.useState<UserDetailPayload | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const url = isCreate ? '/api/v1/admin/users/options' : `/api/v1/admin/users/${userId}`
        const response = await fetch(url)

        if (response.status === 404) {
          toast.error('Usuário não encontrado')
          router.push('/admin/users')
          return
        }

        if (!response.ok) throw new Error('Falha ao carregar dados')

        const result = await response.json()

        if (isCreate) {
          setPayload({ user: null, options: result.data } as UserDetailPayload)
        } else {
          setPayload(result.data as UserDetailPayload)
        }
      } catch (error) {
        toast.error('Erro ao carregar dados')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    const canAccess = readOnly
      ? hasPermission('users_management', 'view')
      : hasPermission('users_management', 'create') || hasPermission('users_management', 'update')

    if (!loading && canAccess) {
      loadData()
    }
  }, [loading, hasPermission, userId, router, readOnly, isCreate])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'users_management')?.name || 'Usuarios'
  }, [activeAccesses])

  if (loading) return null

  const canAccess = readOnly
    ? hasPermission('users_management', 'view')
    : isCreate
      ? hasPermission('users_management', 'create')
      : hasPermission('users_management', 'update')

  if (!canAccess) {
    return forbidden()
  }

  if (isLoadingData || !payload) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-0 p-4 pt-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: screenName, href: '/admin/users' },
          {
            label: isCreate
              ? 'Novo Usuário'
              : payload.user?.name || (readOnly ? 'Visualizar' : 'Editar'),
          },
        ]}
      />

      <UserForm
        mode={isCreate ? 'create' : readOnly ? 'view' : 'edit'}
        user={payload.user}
        options={payload.options}
        onSuccess={() => router.push('/admin/users')}
        onCancel={() => router.push('/admin/users')}
      />
    </div>
  )
}

export default function EditUserPage() {
  return (
    <React.Suspense fallback={null}>
      <EditUserContent />
    </React.Suspense>
  )
}
