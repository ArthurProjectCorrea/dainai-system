'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Pencil, Trash2, Eye, LucideIcon } from 'lucide-react'
import Link from 'next/link'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { DataTableSkeleton } from './data-table-skeleton'
import { DataTableDialog } from './data-table-dialog'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumn?: string
  isLoading?: boolean
  onReload?: () => void
  newConfig?: {
    label?: string
    url?: string
    dialog?: React.ComponentType<{ data?: TData | null; onSuccess: () => void }>
    show?: boolean
  }
  editConfig?: {
    url?: string
    dialog?: React.ComponentType<{ data?: TData | null; onSuccess: () => void }>
    show?: boolean
  }
  viewConfig?: {
    url?: string
    dialog?: React.ComponentType<{ data?: TData | null; onSuccess: () => void; readOnly?: boolean }>
    show?: boolean
  }
  deleteConfig?: {
    onDelete?: (row: TData) => void
    show?: boolean
  }
  rowActions?: {
    icon: LucideIcon
    label: string
    onClick: (row: TData) => void
    show?: boolean
    variant?: 'ghost' | 'destructive' | 'default' | 'secondary'
  }[]
  onSuccess?: () => void
}

export function DataTable<TData, TValue>({
  columns: initialColumns,
  data,
  filterColumn,
  isLoading,
  onReload,
  newConfig,
  editConfig,
  viewConfig,
  deleteConfig,
  rowActions,
  onSuccess,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogTitle, setDialogTitle] = React.useState('')
  const [dialogForm, setDialogForm] = React.useState<React.ComponentType<{
    data?: TData | null
    onSuccess: () => void
  }> | null>(null)
  const [dialogData, setDialogData] = React.useState<TData | null>(null)

  // Delete Alert State
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
  const [rowToDelete, setRowToDelete] = React.useState<TData | null>(null)

  const columns = React.useMemo(() => {
    const cols = [...initialColumns]

    const showEdit = editConfig?.show !== false && (editConfig?.url || editConfig?.dialog)
    const showView = viewConfig?.show !== false && (viewConfig?.url || viewConfig?.dialog)
    const showDelete = deleteConfig?.show !== false && deleteConfig?.onDelete
    const hasRowActions = (rowActions?.length ?? 0) > 0

    if (showEdit || showView || showDelete || hasRowActions) {
      cols.push({
        id: 'actions',
        header: () => <div className="text-center">Ações</div>,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center gap-2">
              <TooltipProvider>
                {showView && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {viewConfig.url ? (
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link
                            href={viewConfig.url
                              .replace(':id', String((row.original as { id: string | number }).id))
                              .replace(
                                '[id]',
                                String((row.original as { id: string | number }).id),
                              )}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setDialogTitle('Visualizar Registro')
                            setDialogForm(() => viewConfig.dialog!)
                            setDialogData(row.original)
                            setDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>Visualizar</TooltipContent>
                  </Tooltip>
                )}

                {showEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {editConfig.url ? (
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link
                            href={editConfig.url
                              .replace(':id', String((row.original as { id: string | number }).id))
                              .replace(
                                '[id]',
                                String((row.original as { id: string | number }).id),
                              )}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setDialogTitle('Editar Registro')
                            setDialogForm(() => editConfig.dialog!)
                            setDialogData(row.original)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                )}

                {showDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setRowToDelete(row.original)
                          setDeleteAlertOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                )}

                {rowActions?.map((action, idx) => {
                  if (action.show === false) return null
                  const Icon = action.icon
                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={action.variant || 'ghost'}
                          size="icon-sm"
                          onClick={e => {
                            e.stopPropagation()
                            action.onClick(row.original)
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{action.label}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
          )
        },
      })
    }

    return cols
  }, [initialColumns, editConfig, viewConfig, deleteConfig, rowActions])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filterColumn={filterColumn}
        onReload={onReload}
        newConfig={
          newConfig?.show !== false && (newConfig?.url || newConfig?.dialog)
            ? {
                ...newConfig,
                onClick: () => {
                  if (newConfig.dialog) {
                    setDialogTitle(newConfig.label || 'Novo Registro')
                    setDialogForm(() => newConfig.dialog!)
                    setDialogData(null)
                    setDialogOpen(true)
                  }
                },
              }
            : undefined
        }
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columnCount={columns.length} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <DataTableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        form={dialogForm}
        formData={dialogData}
        onSuccess={onSuccess}
        readOnly={dialogTitle === 'Visualizar Registro'}
      />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja realmente excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro de nossos
              servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (rowToDelete && deleteConfig?.onDelete) {
                  deleteConfig.onDelete(rowToDelete)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
