'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { CheckCircle2, ShieldOff, FolderOpen } from 'lucide-react'

import { useAdminModule } from '@/hooks/use-admin-module'
import { ModulePageLayout } from '@/components/layouts/module-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/stat-card'
import { ProjectFilter } from '@/components/filter/project-filter'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { Project, ProjectIndicator } from '@/types/project'
import { ProjectForm } from '@/components/form/project-form'

export default function ProjectsPage() {
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
  } = useAdminModule<Project, ProjectIndicator>({
    moduleKey: 'projects_management',
    endpoint: '/api/v1/admin/projects',
    dataKey: 'projects',
    indicatorsKey: 'indicators',
  })

  if (authLoading) return null
  if (!canView) return forbidden()

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
      meta: { title: 'Nome' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Data de Criação" />,
      meta: { title: 'Data de Criação' },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(row.original.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
        </span>
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

  async function handleDelete(project: Project) {
    try {
      const response = await fetch(`/api/v1/admin/projects/${project.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir projeto')
      }
      toast.success('Projeto excluído com sucesso')
      fetchData({ silent: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir projeto')
    }
  }

  return (
    <ModulePageLayout
      breadcrumbItems={[{ label: screenName || 'Meus Projetos' }]}
      stats={
        <>
          <StatCard
            icon={<FolderOpen className="h-4 w-4 text-primary" />}
            title="Total de Projetos"
            value={indicators?.totalProjects || 0}
            description="Projetos sob gestão"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            title="Projetos Ativos"
            value={indicators?.activeProjects || 0}
            description="Em operação normal"
          />
          <StatCard
            icon={<ShieldOff className="h-4 w-4 text-rose-500" />}
            title="Projetos Inativos"
            value={indicators?.inactiveProjects || 0}
            description="Pausados ou desativados"
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
        detailedFilter={{
          component: ProjectFilter,
          label: 'Mais Filtros',
        }}
        isLoading={isLoading}
        onReload={fetchData}
        onSuccess={() => fetchData({ silent: true })}
        newConfig={{
          show: canCreate,
          dialog: ProjectForm,
          label: 'Novo Projeto',
        }}
        editConfig={{ show: canUpdate, url: '/projects/[id]/edit' }}
        viewConfig={{ show: true, url: '/projects/[id]/view' }}
        deleteConfig={{ show: canDelete, onDelete: handleDelete }}
      />
    </ModulePageLayout>
  )
}
