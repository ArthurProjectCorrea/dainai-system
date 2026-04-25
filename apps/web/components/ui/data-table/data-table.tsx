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
import { Pencil, Trash2, Eye, LucideIcon, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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
import { DataTableMobileSkeleton } from './data-table-mobile-skeleton'
import { DataTableDialog } from './data-table-dialog'
import { QuickFilterConfig, DetailedFilterConfig } from './data-table-types'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  quickFilter?: QuickFilterConfig
  detailedFilter?: DetailedFilterConfig<TData>
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
    disabled?: boolean | ((row: TData) => boolean)
    variant?: 'ghost' | 'destructive' | 'default' | 'secondary'
  }[]
  onSuccess?: () => void
}

export function DataTable<TData, TValue>({
  columns: initialColumns,
  data,
  quickFilter,
  detailedFilter,
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
  const isMobile = useIsMobile()
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

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
                  const isDisabled =
                    typeof action.disabled === 'function'
                      ? action.disabled(row.original)
                      : action.disabled

                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={action.variant || 'ghost'}
                          size="icon-sm"
                          disabled={isDisabled}
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

  // eslint-disable-next-line react-hooks/incompatible-library
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

  const showEdit = editConfig?.show !== false && (editConfig?.url || editConfig?.dialog)
  const showView = viewConfig?.show !== false && (viewConfig?.url || viewConfig?.dialog)
  const showDelete = deleteConfig?.show !== false && deleteConfig?.onDelete

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        quickFilter={quickFilter}
        detailedFilter={detailedFilter}
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
      {isMobile ? (
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <DataTableMobileSkeleton rowCount={3} />
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => {
              const visibleCells = row.getVisibleCells()
              const firstCell = visibleCells.find(
                c => c.column.id !== 'actions' && c.column.id !== 'select',
              )
              visibleCells.filter(
                c =>
                  c.column.id !== 'actions' &&
                  c.column.id !== 'select' &&
                  c.column.id !== firstCell?.column.id,
              )
              const isExpanded = expandedRows.has(row.id)

              return (
                <div
                  key={row.id}
                  className="rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      {/* Detect status badge to show in header */}
                      {visibleCells
                        .filter(
                          c => (c.column.columnDef.meta as { title?: string })?.title === 'Status',
                        )
                        .map(cell => (
                          <div key={cell.id} className="scale-90">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ))}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-accent/50 h-9 w-9"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1 shadow-xl">
                        {showView && (
                          <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer">
                            {viewConfig.url ? (
                              <Link
                                href={viewConfig.url
                                  .replace(':id', String((row.original as { id: string }).id))
                                  .replace('[id]', String((row.original as { id: string }).id))}
                              >
                                <span className="text-sm">Visualizar</span>
                              </Link>
                            ) : (
                              <button
                                className="w-full text-left outline-none"
                                onClick={() => {
                                  setDialogTitle('Visualizar Registro')
                                  setDialogForm(() => viewConfig.dialog!)
                                  setDialogData(row.original)
                                  setDialogOpen(true)
                                }}
                              >
                                <span className="text-sm">Visualizar</span>
                              </button>
                            )}
                          </DropdownMenuItem>
                        )}
                        {showEdit && (
                          <DropdownMenuItem asChild className="px-3 py-2 cursor-pointer">
                            {editConfig.url ? (
                              <Link
                                href={editConfig.url
                                  .replace(':id', String((row.original as { id: string }).id))
                                  .replace('[id]', String((row.original as { id: string }).id))}
                              >
                                <span className="text-sm">Editar</span>
                              </Link>
                            ) : (
                              <button
                                className="w-full text-left outline-none"
                                onClick={() => {
                                  setDialogTitle('Editar Registro')
                                  setDialogForm(() => editConfig.dialog!)
                                  setDialogData(row.original)
                                  setDialogOpen(true)
                                }}
                              >
                                <span className="text-sm">Editar</span>
                              </button>
                            )}
                          </DropdownMenuItem>
                        )}
                        {(rowActions?.length ?? 0) > 0 && (
                          <DropdownMenuSeparator className="my-1" />
                        )}
                        {rowActions?.map((action, idx) => {
                          if (action.show === false) return null
                          const isDisabled =
                            typeof action.disabled === 'function'
                              ? action.disabled(row.original)
                              : action.disabled

                          return (
                            <DropdownMenuItem
                              key={idx}
                              disabled={isDisabled}
                              className={cn(
                                'px-3 py-2 cursor-pointer',
                                action.variant === 'destructive' ? 'text-destructive' : '',
                              )}
                              onClick={() => !isDisabled && action.onClick(row.original)}
                            >
                              <span className="text-sm">{action.label}</span>
                            </DropdownMenuItem>
                          )
                        })}
                        {showDelete && (
                          <>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              className="px-3 py-2 cursor-pointer text-destructive"
                              onClick={() => {
                                setRowToDelete(row.original)
                                setDeleteAlertOpen(true)
                              }}
                            >
                              <span className="text-sm">Excluir</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="divide-y divide-border/30 bg-card/50">
                    {visibleCells
                      .filter(
                        c =>
                          c.column.id !== 'actions' &&
                          c.column.id !== 'select' &&
                          (c.column.columnDef.meta as { title?: string })?.title !== 'Status',
                      )
                      .slice(0, isExpanded ? undefined : 3)
                      .map(cell => (
                        <div
                          key={cell.id}
                          className={cn(
                            'flex justify-between px-5 py-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200',
                            (cell.column.columnDef.meta as { title?: string })?.title ===
                              'Categorias'
                              ? 'flex-col gap-2 items-start'
                              : 'flex-row items-center gap-4',
                          )}
                        >
                          <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider opacity-80 shrink-0">
                            {(cell.column.columnDef.meta as { title?: string })?.title ||
                              cell.column.id}
                          </span>
                          <div
                            className={cn(
                              'font-semibold text-foreground',
                              (cell.column.columnDef.meta as { title?: string })?.title ===
                                'Categorias'
                                ? 'w-full'
                                : 'text-right',
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </div>
                      ))}
                  </div>

                  {visibleCells.filter(
                    c =>
                      c.column.id !== 'actions' &&
                      c.column.id !== 'select' &&
                      (c.column.columnDef.meta as { title?: string })?.title !== 'Status',
                  ).length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full rounded-none border-t border-border/20 text-primary hover:text-primary-foreground hover:bg-primary transition-colors h-11 font-bold text-xs uppercase tracking-wider"
                      onClick={() => toggleRow(row.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" /> Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" /> Mostrar mais
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
              <span className="font-semibold text-lg italic">Nenhum resultado encontrado.</span>
              <p className="text-sm mt-1">Tente ajustar seus filtros ou recarregar.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'px-4 py-3',
                        header.id === 'actions' && 'w-0 text-center whitespace-nowrap',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
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
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'px-4',
                          cell.column.id === 'actions' && 'w-0 text-center whitespace-nowrap',
                        )}
                      >
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
      )}
      <DataTablePagination table={table} />

      <DataTableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        form={dialogForm}
        formData={dialogData}
        onSuccess={onSuccess}
        readOnly={dialogTitle === 'Visualizar Registro'}
        canEdit={editConfig?.show}
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
