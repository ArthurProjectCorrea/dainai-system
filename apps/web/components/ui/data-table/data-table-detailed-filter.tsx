'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DetailedFilterConfig } from './data-table-types'

interface DataTableDetailedFilterProps<TData> {
  table: Table<TData>
  config: DetailedFilterConfig<TData>
  hasActiveFilters?: boolean
}

export function DataTableDetailedFilter<TData>({
  table,
  config,
  hasActiveFilters,
}: DataTableDetailedFilterProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const FilterComponent = config.component

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
                  </span>
                )}
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>Filtros Avançados</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent side="right" className="flex flex-col h-full sm:max-w-md p-0">
        <SheetTitle className="sr-only">{config.label || 'Filtros Detalhados'}</SheetTitle>
        <SheetDescription className="sr-only">
          Ajuste os filtros abaixo para refinar os resultados da tabela.
        </SheetDescription>
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <FilterComponent table={table} onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
