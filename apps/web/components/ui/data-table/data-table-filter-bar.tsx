'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTableFilterBarProps } from './data-table-types'
import { DataTableQuickFilter } from './data-table-quick-filter'
import { DataTableDetailedFilter } from './data-table-detailed-filter'

export function DataTableFilterBar<TData>({
  table,
  quickFilter,
  detailedFilter,
  onFilterChange,
}: DataTableFilterBarProps<TData>) {
  const isFiltered = (table?.getState().columnFilters.length ?? 0) > 0

  // Check if there are active filters that ARE NOT the quick filter
  const hasDetailedFilters =
    table?.getState().columnFilters.some(filter => filter.id !== quickFilter?.column) ?? false

  return (
    <div className="flex flex-row flex-wrap items-center gap-2 w-full sm:w-auto">
      {quickFilter && (
        <DataTableQuickFilter table={table} config={quickFilter} onFilterChange={onFilterChange} />
      )}

      {detailedFilter && table && (
        <DataTableDetailedFilter
          table={table}
          config={detailedFilter}
          hasActiveFilters={hasDetailedFilters}
        />
      )}

      {isFiltered && table && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="hidden sm:flex h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
        >
          Limpar Filtros
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
