'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Building2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { forbidden } from 'next/navigation'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatCard } from '@/components/stat-card'
import type { ColumnDef } from '@tanstack/react-table'

import { useAdminModule } from '@/hooks/use-admin-module'
import { ModulePageLayout } from '@/components/layouts/module-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import type { AccessControlPayload, Position } from '@/types/access-control'

export default function AccessControlPage() {
  // The access-control endpoint returns a complex object (not a simple list),
  // so we manage raw payload separately and use useAdminModule for auth + screen name only.
  const { canView, canCreate, canUpdate, canDelete, authLoading } = useAdminModule<Position>({
    moduleKey: 'access_control',
    // No endpoint: this module has a unique payload shape, so fetching is managed manually below
  })

  const [acPayload, setAcPayload] = React.useState<AccessControlPayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchData = React.useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoading(true)
    try {
      const response = await fetch('/api/v1/admin/access-control')
      if (!response.ok) throw new Error('Falha ao carregar dados')
      const result = await response.json()
      setAcPayload(result.data)
    } catch (error) {
      toast.error('Erro ao carregar controle de acesso')
      console.error(error)
    } finally {
      if (!options?.silent) setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!authLoading && canView) {
      fetchData()
    }
  }, [authLoading, canView, fetchData])

  if (authLoading) return null
  if (!canView) return forbidden()

  const handleDeletePosition = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/admin/access-control/positions/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Falha ao remover')
      toast.success('Cargo removido com sucesso')
      fetchData({ silent: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const positionColumns: ColumnDef<Position>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="pl-6">
          <DataTableColumnHeader column={column} title="Nome do Cargo" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="pl-6 py-2">
          <span className="font-medium text-foreground">{row.getValue('name')}</span>
        </div>
      ),
      meta: { title: 'Nome do Cargo' },
    },
    {
      accessorKey: 'departmentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome do Departamento" />
      ),
      cell: ({ row }) => {
        const dept = acPayload?.departments.find(d => d.id === row.getValue('departmentId'))
        return <span className="text-muted-foreground">{dept?.name || 'N/A'}</span>
      },
      meta: { title: 'Nome do Departamento' },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
            {row.getValue('isActive') ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      ),
      meta: { title: 'Status' },
    },
  ]

  return (
    <ModulePageLayout
      breadcrumbItems={[{ label: 'Administrador' }, { label: 'Controle de Acesso' }]}
      stats={
        <>
          <StatCard
            icon={<Building2 className="h-4 w-4 text-primary" />}
            title="Departamentos"
            value={acPayload?.departments.length || 0}
            description="Estrutura organizacional"
          />
          <StatCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
            title="Cargos e Permissões"
            value={acPayload?.positionIndicators?.total || 0}
            description="Regras de acesso ativas"
          />
          <StatCard
            icon={<ShieldAlert className="h-4 w-4 text-blue-500" />}
            title="Telas do Sistema"
            value={acPayload?.screens?.length || 0}
            description="Módulos operacionais"
          />
        </>
      }
    >
      <DataTable
        columns={positionColumns}
        data={acPayload?.data || []}
        quickFilter={{
          type: 'text',
          column: 'name',
          placeholder: 'Pesquisar por cargo...',
        }}
        isLoading={isLoading}
        onReload={fetchData}
        newConfig={{
          show: canCreate,
          url: '/admin/access-control/create',
          label: 'Novo Cargo',
        }}
        editConfig={{ show: canUpdate, url: '/admin/access-control/[id]/edit' }}
        viewConfig={{ show: true, url: '/admin/access-control/[id]/view' }}
        deleteConfig={{ show: canDelete, onDelete: row => handleDeletePosition(row.id) }}
      />
    </ModulePageLayout>
  )
}
