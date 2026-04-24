'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DetailedFilterConfig } from './data-table-types'
import { useIsMobile } from '@/hooks/use-mobile'

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
  const isMobile = useIsMobile()
  const FilterComponent = config.component

  const triggerButton = (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'h-9 w-9 sm:h-8 sm:w-8 relative transition-all duration-200',
        hasActiveFilters && 'border-primary/50 bg-primary/5',
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {hasActiveFilters && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
        </span>
      )}
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{config.label || 'Filtros Detalhados'}</DrawerTitle>
            <DrawerDescription>
              Ajuste os filtros abaixo para refinar os resultados da tabela.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-4">
            <FilterComponent table={table} onClose={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>{triggerButton}</SheetTrigger>
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
