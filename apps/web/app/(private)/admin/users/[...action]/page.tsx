'use client'

import * as React from 'react'
import { forbidden, useParams, useRouter } from 'next/navigation'
import { notify } from '@/lib/notifications'
import { useFormMode } from '@/hooks/use-form-mode'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layouts/page-header'
import { UserForm } from '@/components/form/user-form'
import { getUserByIdAction, getUserOptionsAction } from '@/lib/action/admin-action'
import type { UserDetailPayload } from '@/types'
import Loading from '@/components/ui/loading'

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
        const result = isCreate ? await getUserOptionsAction() : await getUserByIdAction(userId!)

        if (result.error) {
          notify.system.error(result.error)
          if (!isCreate) router.push('/admin/users')
          return
        }

        if (isCreate) {
          setPayload({ user: null, options: result.data } as UserDetailPayload)
        } else {
          setPayload(result.data as UserDetailPayload)
        }
      } catch (error) {
        notify.system.error('Erro ao carregar dados')
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
    return activeAccesses.find(a => a.nameKey === 'users_management')?.nameSidebar || 'Usuarios'
  }, [activeAccesses])

  if (loading || isLoadingData || !payload) return <Loading />

  const canAccess = readOnly
    ? hasPermission('users_management', 'view')
    : isCreate
      ? hasPermission('users_management', 'create')
      : hasPermission('users_management', 'update')

  if (!canAccess) {
    return forbidden()
  }

  return (
    <div className="flex flex-1 flex-col">
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

      <div className="flex flex-1 flex-col gap-0 p-4 pt-2">
        <UserForm
          mode={isCreate ? 'create' : readOnly ? 'view' : 'edit'}
          user={payload.user}
          options={payload.options}
          onSuccess={() => router.push('/admin/users')}
          onCancel={() => router.push('/admin/users')}
          onEdit={
            hasPermission('users_management', 'update')
              ? () => router.push(`/admin/users/${userId}/edit`)
              : undefined
          }
        />
      </div>
    </div>
  )
}

export default function EditUserPage() {
  return (
    <React.Suspense fallback={<Loading />}>
      <EditUserContent />
    </React.Suspense>
  )
}
