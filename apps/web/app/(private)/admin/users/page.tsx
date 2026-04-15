'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { toast } from 'sonner'
import { Users2, ShieldCheck, ShieldAlert, UserRound, Mail } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

import type { UserManagementIndicators, UserManagementUser, UsersListPayload } from '@/types/user'

export default function UsersPage() {
  const { hasPermission, loading, activeAccesses } = useAuth()
  const [data, setData] = React.useState<UserManagementUser[]>([])
  const [indicators, setIndicators] = React.useState<UserManagementIndicators>({
    total: 0,
    active: 0,
    inactive: 0,
  })
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  const fetchUsers = React.useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoadingData(true)
    }

    try {
      const response = await fetch('/api/v1/admin/users')
      if (!response.ok) throw new Error('Falha ao carregar usuarios')

      const result = await response.json()
      const payload: UsersListPayload = result.data

      setData(payload?.users || [])
      setIndicators(
        payload?.indicators || {
          total: 0,
          active: 0,
          inactive: 0,
        },
      )
    } catch (error) {
      toast.error('Erro ao carregar lista de usuarios')
      console.error(error)
    } finally {
      if (!options?.silent) {
        setIsLoadingData(false)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!loading && hasPermission('users_management', 'view')) {
      fetchUsers()
    }
  }, [loading, hasPermission, fetchUsers])

  const screenName = React.useMemo(() => {
    return activeAccesses.find(a => a.nameKey === 'users_management')?.name || 'Usuarios'
  }, [activeAccesses])

  if (loading) return null

  if (!hasPermission('users_management', 'view')) {
    return forbidden()
  }

  const columns: ColumnDef<UserManagementUser>[] = [
    {
      accessorKey: 'avatarUrl',
      header: () => <div className="text-center">Avatar</div>,
      meta: { title: 'Avatar' },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Avatar size="default" className="border">
            <AvatarImage src={row.original.avatarUrl || ''} />
            <AvatarFallback>
              <UserRound className="size-4" />
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
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="E-mail" />,
      meta: { title: 'E-mail' },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: 'vinculos',
      header: () => <div className="text-center">Vinculos</div>,
      meta: { title: 'Vinculos' },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <div className="cursor-help">
                <Badge variant="secondary">{row.original.profileTeams.length}</Badge>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 p-3">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Vínculos e Atribuições
                </p>
                <div className="space-y-2">
                  {row.original.profileTeams.map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex flex-col border-l-2 border-primary/20 pl-2 py-0.5 transition-colors hover:border-primary/40"
                    >
                      <span className="text-sm font-medium leading-none mb-1">
                        {assignment.teamName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {assignment.departmentName} • {assignment.positionName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      ),
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

  const canCreate = hasPermission('users_management', 'create')
  const canUpdate = hasPermission('users_management', 'update')
  const canDelete = hasPermission('users_management', 'delete')
  const createUserUrl = '/admin/users/create'
  const updateUserUrl = '/admin/users/[id]'

  async function handleResendInvitation(user: UserManagementUser) {
    try {
      const response = await fetch(`/api/v1/admin/users/${user.id}/resend-invitation`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        throw new Error(errorResult?.message || 'Erro ao reenviar convite')
      }

      toast.success('Link de convite enviado com sucesso!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao reenviar convite'
      toast.error(message)
    }
  }

  async function handleDelete(user: UserManagementUser) {
    try {
      const response = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        throw new Error(errorResult?.message || 'Erro ao excluir usuario')
      }

      toast.success('Usuario removido com sucesso')
      fetchUsers({ silent: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir usuario'
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader breadcrumbs={[{ label: 'Administrador' }, { label: screenName }]} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users2}
          title="Total de Usuarios"
          value={indicators.total}
          description="Usuarios cadastrados no sistema"
          className="bg-primary/5 border-primary/10 transition-transform hover:scale-[1.01]"
        />
        <StatCard
          icon={ShieldCheck}
          title="Usuarios Ativos"
          value={indicators.active}
          description="Com acesso liberado"
          iconClassName="bg-emerald-500/10 text-emerald-500"
          className="transition-transform hover:scale-[1.01]"
        />
        <StatCard
          icon={ShieldAlert}
          title="Usuarios Inativos"
          value={indicators.inactive}
          description="Bloqueados ou removidos"
          iconClassName="bg-amber-500/10 text-amber-500"
          className="transition-transform hover:scale-[1.01]"
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        filterColumn="email"
        isLoading={isLoadingData}
        onReload={fetchUsers}
        onSuccess={() => fetchUsers({ silent: true })}
        newConfig={{
          show: canCreate,
          url: createUserUrl,
        }}
        editConfig={{
          show: canUpdate,
          url: updateUserUrl,
        }}
        deleteConfig={{
          show: canDelete,
          onDelete: handleDelete,
        }}
        rowActions={[
          {
            icon: Mail,
            label: 'Reenviar Convite',
            onClick: handleResendInvitation,
            show: canUpdate,
          },
        ]}
      />
    </div>
  )
}
