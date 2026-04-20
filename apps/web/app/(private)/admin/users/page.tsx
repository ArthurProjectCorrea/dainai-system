'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { toast } from 'sonner'
import { Users2, ShieldCheck, ShieldAlert, UserRound, Mail } from 'lucide-react'

import { useAdminModule } from '@/hooks/use-admin-module'
import { ModulePageLayout } from '@/components/layouts/module-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

import type { UserManagementIndicators, UserManagementUser } from '@/types/user'

export default function UsersPage() {
  const {
    data,
    indicators,
    isLoading,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    screenName,
    fetchData,
    authLoading,
  } = useAdminModule<UserManagementUser, UserManagementIndicators>({
    moduleKey: 'users_management',
    endpoint: '/api/v1/admin/users',
    dataKey: 'users',
    indicatorsKey: 'indicators',
  })

  if (authLoading) return null
  if (!canView) return forbidden()

  const stats: UserManagementIndicators = indicators ?? { total: 0, active: 0, inactive: 0 }

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
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
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
                      <span className="text-xs text-muted-foreground">
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
      toast.error(error instanceof Error ? error.message : 'Erro ao reenviar convite')
    }
  }

  async function handleDelete(user: UserManagementUser) {
    try {
      const response = await fetch(`/api/v1/admin/users/${user.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorResult = await response.json().catch(() => null)
        throw new Error(errorResult?.message || 'Erro ao excluir usuario')
      }
      toast.success('Usuario removido com sucesso')
      fetchData({ silent: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir usuario')
    }
  }

  return (
    <ModulePageLayout
      breadcrumbItems={[{ label: 'Administrador' }, { label: screenName || 'Usuários' }]}
      stats={
        <>
          <StatCard
            icon={<Users2 className="h-4 w-4 text-primary" />}
            title="Total de Usuários"
            value={stats.total}
            description="Perfis ativos e inativos"
          />
          <StatCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
            title="Usuários Ativos"
            value={stats.active}
            description="Acesso ao sistema liberado"
          />
          <StatCard
            icon={<ShieldAlert className="h-4 w-4 text-rose-500" />}
            title="Usuários Inativos"
            value={stats.inactive}
            description="Acesso bloqueado ou pendente"
          />
        </>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        quickFilter={{
          type: 'text',
          column: 'email',
          placeholder: 'Pesquisar por e-mail...',
        }}
        isLoading={isLoading}
        onReload={fetchData}
        onSuccess={() => fetchData({ silent: true })}
        newConfig={{ show: canCreate, url: '/admin/users/create' }}
        editConfig={{ show: canUpdate, url: '/admin/users/[id]/edit' }}
        viewConfig={{ show: true, url: '/admin/users/[id]/view' }}
        deleteConfig={{ show: canDelete, onDelete: handleDelete }}
        rowActions={[
          {
            icon: Mail,
            label: 'Reenviar Convite',
            onClick: handleResendInvitation,
            show: canUpdate,
          },
        ]}
      />
    </ModulePageLayout>
  )
}
