'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { cn } from '@/lib/utils'
import { QuickFilterConfig } from './data-table-types'

interface DataTableQuickFilterProps<TData> {
  table?: Table<TData>
  config: QuickFilterConfig
  onFilterChange?: (column: string, value: unknown) => void
}

export function DataTableQuickFilter<TData>({
  table,
  config,
  onFilterChange,
}: DataTableQuickFilterProps<TData>) {
  const column = table?.getColumn(config.column)
  const [value, setValue] = React.useState<unknown>(() => {
    if (table) return column?.getFilterValue() ?? ''
    return ''
  })

  // Sync internal state with table state
  React.useEffect(() => {
    if (table) {
      setValue(column?.getFilterValue() ?? '')
    }
  }, [table, column])

  const handleValueChange = (newValue: unknown) => {
    setValue(newValue)
    if (table) {
      column?.setFilterValue(newValue)
    }
    if (onFilterChange) {
      onFilterChange(config.column, newValue)
    }
  }

  const clearFilter = () => {
    handleValueChange(undefined)
  }

  // --- Render Helpers ---

  if (config.type === 'select') {
    return (
      <Select value={value as string} onValueChange={handleValueChange}>
        <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
          <SelectValue placeholder={config.placeholder || 'Selecionar...'} />
        </SelectTrigger>
        <SelectContent>
          {config.options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (config.type === 'date') {
    return (
      <DatePicker
        date={value ? new Date(value as string) : undefined}
        setDate={date => handleValueChange(date?.toISOString())}
        className={cn('w-[150px] lg:w-[200px]')}
        showClear
      />
    )
  }

  if (config.type === 'daterange') {
    const range: DateRange | undefined = value
      ? {
          from: (value as { from?: string }).from
            ? new Date((value as { from?: string }).from!)
            : undefined,
          to: (value as { to?: string }).to ? new Date((value as { to?: string }).to!) : undefined,
        }
      : undefined

    return (
      <DateRangePicker
        value={range}
        onChange={newRange => {
          if (newRange) {
            handleValueChange({
              from: newRange.from?.toISOString(),
              to: newRange.to?.toISOString(),
            })
          } else {
            handleValueChange(undefined)
          }
        }}
        className={cn('w-[200px] lg:w-[250px]')}
        showClear
      />
    )
  }

  // Default to text
  return (
    <div className="relative flex items-center">
      <Input
        placeholder={config.placeholder || 'Filtrar...'}
        value={(value as string) ?? ''}
        onChange={event => handleValueChange(event.target.value)}
        className="h-8 w-[150px] lg:w-[250px]"
      />
      {!!value && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clearFilter}
          className="absolute right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
