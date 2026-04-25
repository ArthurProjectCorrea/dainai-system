'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { forbidden } from 'next/navigation'
import { FileText, CheckCircle2, Clock, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

import { useAdminModule } from '@/hooks/use-admin-module'
import { ModulePageLayout } from '@/components/layouts/module-page-layout'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { DocumentFilter } from '@/components/filter/document-filter'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  deleteDocumentAction,
  getCategoriesAction,
  publishDocumentAction,
} from '@/lib/action/document-action'
import type { Document, DocumentIndicator, Category } from '@/types'
import type { Project } from '@/types'

export default function DocumentsPage() {
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
  } = useAdminModule<Document, DocumentIndicator>({
    moduleKey: 'documents_management',
    endpoint: '/api/v1/admin/documents',
    dataKey: 'documents',
    indicatorsKey: 'indicators',
  })

  const [projects, setProjects] = React.useState<Project[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [docToApprove, setDocToApprove] = React.useState<Document | null>(null)
  const [isApproveOpen, setIsApproveOpen] = React.useState(false)

  React.useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [projRes, catRes] = await Promise.all([
          fetch('/api/v1/admin/projects').then(async r => {
            const text = await r.text()
            return text ? JSON.parse(text) : {}
          }),
          getCategoriesAction(),
        ])

        if (projRes.data?.projects) setProjects(projRes.data.projects)
        if (catRes.data) setCategories(catRes.data)
      } catch (error) {
        console.error('Failed to load filter options', error)
      }
    }
    loadFilterOptions()
  }, [])

  if (authLoading) return null
  if (!canView) return forbidden()

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Documento" />,
      meta: { title: 'Documento' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'projectName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Projeto" />,
      meta: { title: 'Projeto' },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.projectName}</span>
      ),
    },
    {
      accessorKey: 'categories',
      header: 'Categorias',
      meta: { title: 'Categorias' },
      cell: ({ row }) => {
        const cats = row.original.categories
        const displayLimit = 3
        const hasMore = cats.length > displayLimit
        const visibleCats = cats.slice(0, displayLimit)
        const moreCount = cats.length - displayLimit

        const truncate = (str: string, len = 12) =>
          str.length > len ? str.substring(0, len) + '...' : str

        return (
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <div className="flex flex-wrap gap-1 cursor-default py-1">
                {visibleCats.map(cat => (
                  <Badge
                    key={cat.id}
                    variant="outline"
                    className="text-xs py-0 px-1.5 whitespace-nowrap"
                  >
                    {truncate(cat.name)}
                  </Badge>
                ))}
                {hasMore && (
                  <Badge variant="secondary" className="text-xs py-0 px-1.5 font-bold">
                    +{moreCount}
                  </Badge>
                )}
                {cats.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Sem categ.</span>
                )}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto min-w-40 p-3 shadow-xl">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 border-b pb-1">
                  Categorias ({cats.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {cats.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      },
      filterFn: (row, id, value: number[]) => {
        if (!value || value.length === 0) return true
        const rowCats: Category[] = row.getValue(id)
        return rowCats.some(c => value.includes(c.id))
      },
    },
    {
      accessorKey: 'isPublished',
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      meta: { title: 'Status' },
      cell: ({ row }) => {
        const isPublished = row.original.isPublished
        return (
          <div className="flex justify-center">
            <Badge variant={isPublished ? 'default' : 'outline'}>
              {isPublished ? 'Publicado' : 'Rascunho'}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Criado em" />,
      meta: { title: 'Criado em' },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
        </span>
      ),
      filterFn: (row, id, value: { from?: Date; to?: Date }) => {
        if (!value || (!value.from && !value.to)) return true
        const rowDate = new Date(row.getValue(id))
        const from = value.from ? new Date(value.from) : null
        const to = value.to ? new Date(value.to) : null

        if (from && to) {
          return rowDate >= from && rowDate <= to
        }
        if (from) {
          return rowDate >= from
        }
        if (to) {
          return rowDate <= to
        }
        return true
      },
    },
  ]

  async function handleDelete(doc: Document) {
    try {
      const res = await deleteDocumentAction(doc.id)
      if (res.error) throw new Error(res.error)
      toast.success('Documento excluído com sucesso')
      fetchData({ silent: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir documento')
    }
  }

  async function handleApprove() {
    if (!docToApprove) return
    try {
      const res = await publishDocumentAction(docToApprove.id)
      if (res.error) throw new Error(res.error)
      toast.success('Documento publicado com sucesso!')
      fetchData({ silent: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao publicar documento')
    } finally {
      setIsApproveOpen(false)
      setDocToApprove(null)
    }
  }

  return (
    <ModulePageLayout
      breadcrumbItems={[{ label: screenName || 'Documentos' }]}
      stats={
        <>
          <StatCard
            icon={<FileText className="h-4 w-4 text-primary" />}
            title="Total"
            value={indicators?.total || 0}
            description="Documentos gerenciados"
          />
          <StatCard
            icon={<Globe className="h-4 w-4 text-emerald-500" />}
            title="Publicados"
            value={indicators?.published || 0}
            description="Visíveis na Wiki"
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-amber-500" />}
            title="Rascunhos"
            value={indicators?.drafts || 0}
            description="Documentos em edição"
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
          component: props => (
            <DocumentFilter {...props} projects={projects} categories={categories} />
          ),
          label: 'Mais Filtros',
        }}
        isLoading={isLoading}
        onReload={fetchData}
        onSuccess={() => fetchData({ silent: true })}
        newConfig={{
          show: canCreate,
          url: '/documents/create',
          label: 'Novo Documento',
        }}
        editConfig={{ show: canUpdate, url: '/documents/[id]/edit' }}
        viewConfig={{ show: true, url: '/documents/[id]/view' }}
        deleteConfig={{ show: canDelete, onDelete: handleDelete }}
        rowActions={[
          {
            icon: CheckCircle2,
            label: 'Publicar',
            onClick: doc => {
              setDocToApprove(doc)
              setIsApproveOpen(true)
            },
            disabled: doc => doc.isPublished,
            show: canUpdate,
          },
        ]}
      />

      <AlertDialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja publicar este documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao publicar, uma nova versão deste documento será gerada e ele ficará visível na Wiki
              como <strong>Publicado</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>Confirmar Publicação</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModulePageLayout>
  )
}
