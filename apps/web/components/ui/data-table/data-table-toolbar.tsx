'use client'

import { Table } from '@tanstack/react-table'
import { RefreshCw, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableViewOptions } from './data-table-view-options'

import { DataTableFilterBar } from './data-table-filter-bar'
import { QuickFilterConfig, DetailedFilterConfig } from './data-table-types'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  quickFilter?: QuickFilterConfig
  detailedFilter?: DetailedFilterConfig<TData>
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
  quickFilter,
  detailedFilter,
  onReload,
  newConfig,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <DataTableFilterBar
        table={table}
        quickFilter={quickFilter}
        detailedFilter={detailedFilter}
        onReload={onReload}
      />

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
