'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { Users2, ShieldCheck, ShieldAlert } from 'lucide-react'

import { useAdminModule } from '@/hooks/use-admin-module'
import { ModulePageLayout } from '@/components/layouts/module-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { TeamForm } from '@/components/form/team-form'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'

import { notify } from '@/lib/notifications'

import { Team } from '@/types'
import { deleteTeamAction } from '@/lib/action/admin-action'

export default function TeamsPage() {
  const {
    data,
    isLoading,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    screenName,
    fetchData,
    authLoading,
  } = useAdminModule<Team>({
    moduleKey: 'teams_management',
    endpoint: '/api/v1/admin/teams',
  })

  if (authLoading) return null
  if (!canView) return forbidden()

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
      meta: { title: 'Nome' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      meta: { title: 'Status' },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      ),
    },
  ]

  async function handleDelete(team: Team) {
    try {
      const result = await deleteTeamAction(team.id)
      if (result.error) throw new Error(result.error)
      notify.admin.team.deleteSuccess()
      fetchData({ silent: true })
    } catch (error) {
      notify.system.error(error instanceof Error ? error.message : 'Erro ao excluir equipe')
    }
  }

  const active = data.filter(t => t.isActive).length
  const inactive = data.filter(t => !t.isActive).length

  return (
    <ModulePageLayout
      breadcrumbItems={[{ label: 'Administrador' }, { label: screenName || 'Equipes' }]}
      stats={
        <>
          <StatCard
            icon={<Users2 className="h-4 w-4 text-primary" />}
            title="Total de Equipes"
            value={data.length}
            description="Equipes cadastradas no sistema"
          />
          <StatCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
            title="Equipes Ativas"
            value={active}
            description="Operacionais no momento"
          />
          <StatCard
            icon={<ShieldAlert className="h-4 w-4 text-amber-500" />}
            title="Equipes Inativas"
            value={inactive}
            description="Aguardando ativação ou inativas"
          />
        </>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        quickFilter={{
          type: 'text',
          column: 'name',
          placeholder: 'Pesquisar por nome...',
        }}
        isLoading={isLoading}
        onReload={fetchData}
        onSuccess={() => fetchData({ silent: true })}
        newConfig={{ show: canCreate, dialog: TeamForm }}
        editConfig={{ show: canUpdate, dialog: TeamForm }}
        viewConfig={{ show: true, dialog: TeamForm }}
        deleteConfig={{ show: canDelete, onDelete: handleDelete }}
      />
    </ModulePageLayout>
  )
}
