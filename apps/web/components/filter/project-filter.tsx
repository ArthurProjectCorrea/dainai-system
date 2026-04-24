'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel, FieldContent, FieldSet } from '@/components/ui/field'

interface ProjectFilterProps<TData> {
  table: Table<TData>
  onClose?: () => void
}

export function ProjectFilter<TData>({ table, onClose }: ProjectFilterProps<TData>) {
  const statusColumn = table.getColumn('isActive')
  const dateColumn = table.getColumn('createdAt')

  const [status, setStatus] = React.useState<string>(() => {
    const val = statusColumn?.getFilterValue()
    if (val === true) return 'active'
    if (val === false) return 'inactive'
    return 'all'
  })

  const [date, setDate] = React.useState<Date | undefined>(() => {
    const val = dateColumn?.getFilterValue()
    return val ? new Date(val as string) : undefined
  })

  const applyFilters = () => {
    // Apply Status
    if (status === 'all') {
      statusColumn?.setFilterValue(undefined)
    } else {
      statusColumn?.setFilterValue(status === 'active')
    }

    // Apply Date
    if (date) {
      dateColumn?.setFilterValue(date.toISOString())
    } else {
      dateColumn?.setFilterValue(undefined)
    }

    // Close the sheet if callback provided
    onClose?.()
  }

  const resetFilters = () => {
    setStatus('all')
    setDate(undefined)
    statusColumn?.setFilterValue(undefined)
    dateColumn?.setFilterValue(undefined)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <FieldSet className="flex-1 space-y-4">
        {/* Status Field */}
        <Field>
          <FieldLabel>Status do Projeto</FieldLabel>
          <FieldContent>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        {/* Date Field */}
        <Field>
          <FieldLabel>Data de Criação</FieldLabel>
          <FieldContent className="flex justify-center w-full">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </FieldContent>
        </Field>
      </FieldSet>

      <div className="space-y-4 pt-4 pb-0">
        <Separator className="opacity-50" />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 gap-2 h-11 rounded-xl" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button className="flex-1 gap-2 h-11 rounded-xl shadow-lg" onClick={applyFilters}>
            <Check className="h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
