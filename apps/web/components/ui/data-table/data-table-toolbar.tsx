'use client'

import { Table } from '@tanstack/react-table'
import { RefreshCw, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableViewOptions } from './data-table-view-options'

import { DataTableFilterBar } from './data-table-filter-bar'
import { QuickFilterConfig, DetailedFilterConfig } from './data-table-types'

import { useIsMobile } from '@/hooks/use-mobile'

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
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2">
      <DataTableFilterBar
        table={table}
        quickFilter={quickFilter}
        detailedFilter={detailedFilter}
        onReload={onReload}
      />

      <div className="flex items-center justify-end space-x-2">
        <TooltipProvider>
          {onReload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onReload} size="icon" className="h-10 w-10 p-0">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recarregar</TooltipContent>
            </Tooltip>
          )}

          {!isMobile && <DataTableViewOptions table={table} />}

          {newConfig && (
            <>
              {newConfig.url ? (
                <Button className="h-10" asChild>
                  <Link href={newConfig.url}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Registro
                  </Link>
                </Button>
              ) : (
                <Button className="h-10" onClick={newConfig.onClick}>
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
