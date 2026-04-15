'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatCard } from '@/components/stat-card'
import type { ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/ui/data-table/data-table'
import type { AccessControlPayload, Position } from '@/types/access-control'

export default function AccessControlPage() {
  const { hasPermission, loading: authLoading, activeAccesses } = useAuth()
  const [data, setData] = React.useState<AccessControlPayload | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  const fetchData = React.useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoadingData(true)
    try {
      const response = await fetch('/api/v1/admin/access-control')
      if (!response.ok) throw new Error('Falha ao carregar dados')
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      toast.error('Erro ao carregar controle de acesso')
      console.error(error)
    } finally {
      if (!options?.silent) setIsLoadingData(false)
    }
  }, [])

  React.useEffect(() => {
    if (!authLoading && hasPermission('access_control', 'view')) {
      fetchData()
    }
  }, [authLoading, hasPermission, fetchData])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'access_control')?.name || 'Controle de Acesso'
  }, [activeAccesses])

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
        const dept = data?.departments.find(d => d.id === row.getValue('departmentId'))
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

  if (authLoading) return null

  const canCreate = hasPermission('access_control', 'create')
  const canUpdate = hasPermission('access_control', 'update')
  const canDelete = hasPermission('access_control', 'delete')

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader breadcrumbs={[{ label: 'Administrador' }, { label: screenName }]} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Shield}
          title="Total de Cargos"
          value={data?.positionIndicators?.total || 0}
          description="Cargos cadastrados"
          className="bg-primary/5 border-primary/10 transition-transform hover:scale-[1.01]"
        />
        <StatCard
          icon={ShieldCheck}
          title="Cargos Ativos"
          value={data?.positionIndicators?.active || 0}
          description="Operacionais"
          iconClassName="bg-emerald-500/10 text-emerald-500"
          className="transition-transform hover:scale-[1.01]"
        />
        <StatCard
          icon={ShieldAlert}
          title="Cargos Inativos"
          value={data?.positionIndicators?.inactive || 0}
          description="Bloqueados"
          iconClassName="bg-amber-500/10 text-amber-500"
          className="transition-transform hover:scale-[1.01]"
        />
      </div>

      <DataTable
        columns={positionColumns}
        data={data?.data || []}
        filterColumn="name"
        isLoading={isLoadingData}
        onReload={fetchData}
        newConfig={{
          show: canCreate,
          url: '/admin/access-control/create',
          label: 'Novo Cargo',
        }}
        editConfig={{
          show: canUpdate,
          url: '/admin/access-control/[id]',
        }}
        deleteConfig={{
          show: canDelete,
          onDelete: row => handleDeletePosition(row.id),
        }}
      />
    </div>
  )
}
