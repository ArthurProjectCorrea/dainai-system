'use client'

import * as React from 'react'
import { forbidden, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/page-header'
import { UserForm } from '@/components/form/user-form'

import type { UserDetailPayload } from '@/types/user'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const userId = params.id

  const { hasPermission, loading, activeAccesses } = useAuth()
  const [payload, setPayload] = React.useState<UserDetailPayload | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`/api/v1/admin/users/${userId}`)

        if (response.status === 404) {
          toast.error('Usuario nao encontrado')
          router.push('/admin/users')
          return
        }

        if (!response.ok) throw new Error('Falha ao carregar dados do usuario')

        const result = await response.json()
        const data: UserDetailPayload = result.data
        setPayload(data)
      } catch (error) {
        toast.error('Erro ao carregar dados para edicao')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (!loading && hasPermission('users_management', 'update')) {
      loadUser()
    }
  }, [loading, hasPermission, userId, router])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'users_management')?.name || 'Usuarios'
  }, [activeAccesses])

  if (loading) return null

  if (!hasPermission('users_management', 'update')) {
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
          { label: payload.user.name || 'Editar Usuario' },
        ]}
      />

      <UserForm
        mode="edit"
        user={payload.user}
        options={payload.options}
        onSuccess={() => router.push('/admin/users')}
        onCancel={() => router.push('/admin/users')}
      />
    </div>
  )
}
