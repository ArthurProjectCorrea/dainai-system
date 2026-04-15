'use client'

import * as React from 'react'
import { forbidden, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/page-header'
import { UserForm } from '@/components/form/user-form'

import type { UserManagementOptions, UsersListPayload } from '@/types/user'

export default function CreateUserPage() {
  const router = useRouter()
  const { hasPermission, loading, activeAccesses } = useAuth()
  const [options, setOptions] = React.useState<UserManagementOptions | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch('/api/v1/admin/users')
        if (!response.ok) throw new Error('Falha ao carregar dados do formulario')

        const result = await response.json()
        const payload: UsersListPayload = result.data
        setOptions(payload.options)
      } catch (error) {
        toast.error('Erro ao carregar dados de suporte para criacao')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (!loading && hasPermission('users_management', 'create')) {
      loadOptions()
    }
  }, [loading, hasPermission])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'users_management')?.name || 'Usuarios'
  }, [activeAccesses])

  if (loading) return null

  if (!hasPermission('users_management', 'create')) {
    return forbidden()
  }

  if (isLoadingData || !options) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-0 p-4 pt-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Administrador' },
          { label: screenName, href: '/admin/users' },
          { label: 'Criar Usuario' },
        ]}
      />

      <UserForm
        mode="create"
        options={options}
        onSuccess={() => router.push('/admin/users')}
        onCancel={() => router.push('/admin/users')}
      />
    </div>
  )
}
