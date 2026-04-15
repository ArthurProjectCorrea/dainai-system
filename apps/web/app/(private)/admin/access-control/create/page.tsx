'use client'

import * as React from 'react'
import { forbidden, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/page-header'
import { AccessControlForm } from '@/components/form/access-control-form'
import type { AccessControlPayload } from '@/types/access-control'

function CreateAccessControlContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') as 'position' | 'department') || 'position'

  const { hasPermission, loading, activeAccesses } = useAuth()
  const [options, setOptions] = React.useState<AccessControlPayload | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  React.useEffect(() => {
    async function fetchOptions() {
      try {
        const response = await fetch('/api/v1/admin/access-control')
        if (!response.ok) throw new Error('Falha ao carregar opções')
        const result = await response.json()
        setOptions(result.data)
      } catch (error) {
        toast.error('Erro ao carregar dados para o formulário')
        console.error(error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (!loading && hasPermission('access_control', 'create')) {
      fetchOptions()
    }
  }, [loading, hasPermission])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'access_control')?.name || 'Controle de Acesso'
  }, [activeAccesses])

  if (loading) return null

  if (!hasPermission('access_control', 'create')) {
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
          { label: screenName, href: '/admin/access-control' },
          { label: `Novo ${type === 'department' ? 'Departamento' : 'Cargo'}` },
        ]}
      />

      <AccessControlForm
        mode={type}
        type="create"
        options={options}
        onSuccess={() => router.push('/admin/access-control')}
        onCancel={() => router.push('/admin/access-control')}
      />
    </div>
  )
}

export default function CreateAccessControlPage() {
  return (
    <React.Suspense fallback={null}>
      <CreateAccessControlContent />
    </React.Suspense>
  )
}
