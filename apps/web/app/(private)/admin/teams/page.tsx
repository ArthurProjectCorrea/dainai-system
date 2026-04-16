'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { Building2, Users2, ShieldCheck, ShieldAlert } from 'lucide-react'

import { useAdminModule } from '@/hooks/use-admin-module'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { TeamForm } from '@/components/form/team-form'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

import { Team } from '@/types/team'

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
      accessorKey: 'logotipoUrl',
      header: () => <div className="text-center">Logotipo</div>,
      meta: { title: 'Logotipo' },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Avatar size="default" className="border">
            <AvatarImage src={row.original.logotipoUrl || ''} />
            <AvatarFallback>
              <Building2 className="size-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      ),
    },
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
      const response = await fetch(`/api/v1/admin/teams/${team.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir equipe')
      }
      toast.success('Equipe excluída com sucesso')
      fetchData({ silent: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir equipe')
    }
  }

  const active = data.filter(t => t.isActive).length
  const inactive = data.filter(t => !t.isActive).length

  return (
    <AdminPageLayout
      screenName={screenName || 'Equipes'}
      stats={
        <>
          <StatCard
            icon={Users2}
            title="Total de Equipes"
            value={data.length}
            description="Equipes cadastradas no sistema"
            className="bg-primary/5 border-primary/10 transition-transform hover:scale-[1.01]"
          />
          <StatCard
            icon={ShieldCheck}
            title="Equipes Ativas"
            value={active}
            description="Operacionais no momento"
            iconClassName="bg-emerald-500/10 text-emerald-500"
            className="transition-transform hover:scale-[1.01]"
          />
          <StatCard
            icon={ShieldAlert}
            title="Equipes Inativas"
            value={inactive}
            description="Aguardando ativação ou inativas"
            iconClassName="bg-amber-500/10 text-amber-500"
            className="transition-transform hover:scale-[1.01]"
          />
        </>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        isLoading={isLoading}
        onReload={fetchData}
        onSuccess={() => fetchData({ silent: true })}
        newConfig={{ show: canCreate, dialog: TeamForm }}
        editConfig={{ show: canUpdate, dialog: TeamForm }}
        viewConfig={{ show: true, dialog: TeamForm }}
        deleteConfig={{ show: canDelete, onDelete: handleDelete }}
      />
    </AdminPageLayout>
  )
}
