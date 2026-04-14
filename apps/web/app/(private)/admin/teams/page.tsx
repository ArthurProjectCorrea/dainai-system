'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { PageHeader } from '@/components/page-header'
import { TeamForm } from '@/components/form/team-form'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Building2, Users2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { StatCard } from '@/components/stat-card'

import { Team } from '@/types/team'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function TeamsPage() {
  const { hasPermission, loading, activeAccesses } = useAuth()
  const [data, setData] = React.useState<Team[]>([])
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  const fetchTeams = React.useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoadingData(true)
    }
    try {
      const response = await fetch('/api/v1/admin/teams')
      if (!response.ok) throw new Error('Falha ao carregar equipes')
      const result = await response.json()
      setData(result.data || [])
    } catch (error) {
      toast.error('Erro ao carregar lista de equipes')
      console.error(error)
    } finally {
      if (!options?.silent) {
        setIsLoadingData(false)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!loading && hasPermission('teams_management', 'view')) {
      fetchTeams()
    }
  }, [loading, hasPermission, fetchTeams])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'teams_management')?.name || 'Equipes'
  }, [activeAccesses])

  if (loading) return null

  if (!hasPermission('teams_management', 'view')) {
    return forbidden()
  }

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

  const canCreate = hasPermission('teams_management', 'create')
  const canUpdate = hasPermission('teams_management', 'update')
  const canDelete = hasPermission('teams_management', 'delete')

  async function handleDelete(team: Team) {
    try {
      const response = await fetch(`/api/v1/admin/teams/${team.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir equipe')
      }
      toast.success('Equipe excluída com sucesso')
      fetchTeams({ silent: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir equipe'
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader breadcrumbs={[{ label: 'Administrador' }, { label: screenName }]} />

      <div className="grid gap-4 md:grid-cols-3">
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
          value={data.filter(t => t.isActive).length}
          description="Operacionais no momento"
          iconClassName="bg-emerald-500/10 text-emerald-500"
          className="transition-transform hover:scale-[1.01]"
        />
        <StatCard
          icon={ShieldAlert}
          title="Equipes Inativas"
          value={data.filter(t => !t.isActive).length}
          description="Aguardando ativação ou inativas"
          iconClassName="bg-amber-500/10 text-amber-500"
          className="transition-transform hover:scale-[1.01]"
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        isLoading={isLoadingData}
        onReload={fetchTeams}
        onSuccess={() => fetchTeams({ silent: true })}
        newConfig={{
          show: canCreate,
          dialog: TeamForm,
        }}
        editConfig={{
          show: canUpdate,
          dialog: TeamForm,
        }}
        deleteConfig={{
          show: canDelete,
          onDelete: handleDelete,
        }}
      />
    </div>
  )
}
