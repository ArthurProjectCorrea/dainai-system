'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { forbidden } from 'next/navigation'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatCard } from '@/components/stat-card'
import type { ColumnDef } from '@tanstack/react-table'

import { useAdminModule } from '@/hooks/use-admin-module'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import type { AccessControlPayload, Position } from '@/types/access-control'

export default function AccessControlPage() {
  // The access-control endpoint returns a complex object (not a simple list),
  // so we manage raw payload separately and use useAdminModule for auth + screen name only.
  const { canView, canCreate, canUpdate, canDelete, screenName, authLoading } =
    useAdminModule<Position>({
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
    <AdminPageLayout
      screenName={screenName || 'Controle de Acesso'}
      stats={
        <>
          <StatCard
            icon={Shield}
            title="Total de Cargos"
            value={acPayload?.positionIndicators?.total || 0}
            description="Cargos cadastrados"
            className="bg-primary/5 border-primary/10 transition-transform hover:scale-[1.01]"
          />
          <StatCard
            icon={ShieldCheck}
            title="Cargos Ativos"
            value={acPayload?.positionIndicators?.active || 0}
            description="Operacionais"
            iconClassName="bg-emerald-500/10 text-emerald-500"
            className="transition-transform hover:scale-[1.01]"
          />
          <StatCard
            icon={ShieldAlert}
            title="Cargos Inativos"
            value={acPayload?.positionIndicators?.inactive || 0}
            description="Bloqueados"
            iconClassName="bg-amber-500/10 text-amber-500"
            className="transition-transform hover:scale-[1.01]"
          />
        </>
      }
    >
      <DataTable
        columns={positionColumns}
        data={acPayload?.data || []}
        filterColumn="name"
        isLoading={isLoading}
        onReload={fetchData}
        newConfig={{
          show: canCreate,
          url: '/admin/access-control/create',
          label: 'Novo Cargo',
        }}
        editConfig={{ show: canUpdate, url: '/admin/access-control/[id]' }}
        viewConfig={{ show: true, url: '/admin/access-control/[id]?mode=view' }}
        deleteConfig={{ show: canDelete, onDelete: row => handleDeletePosition(row.id) }}
      />
    </AdminPageLayout>
  )
}
