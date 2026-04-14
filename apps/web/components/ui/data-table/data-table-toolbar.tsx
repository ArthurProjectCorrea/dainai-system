'use client'

import { Table } from '@tanstack/react-table'
import { RefreshCw, X, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterColumn?: string
  onReload?: () => void
  newConfig?: {
    label?: string
    url?: string
    dialog?: React.ComponentType<{ data?: TData | null; onSuccess: () => void }>
    onClick?: () => void
  }
}

export function DataTableToolbar<TData>({
  table,
  filterColumn = 'email',
  onReload,
  newConfig,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar..."
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
          onChange={event => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider>
          {onReload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onReload} className="h-8 w-8 p-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recarregar</TooltipContent>
            </Tooltip>
          )}

          <DataTableViewOptions table={table} />

          {newConfig && (
            <>
              {newConfig.url ? (
                <Button size="sm" className="h-8" asChild>
                  <Link href={newConfig.url}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Registro
                  </Link>
                </Button>
              ) : (
                <Button size="sm" className="h-8" onClick={newConfig.onClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Registro
                </Button>
              )}
            </>
          )}
        </TooltipProvider>
      </div>
    </div>
  )
}
