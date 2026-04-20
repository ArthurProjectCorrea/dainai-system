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
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel, FieldContent, FieldSet } from '@/components/ui/field'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { DateRange } from 'react-day-picker'
import type { Category } from '@/types/document'
import type { Project } from '@/types/project'

interface DocumentFilterProps<TData> {
  table: Table<TData>
  projects: Project[]
  categories: Category[]
  onClose?: () => void
}

export function DocumentFilter<TData>({
  table,
  projects,
  categories,
  onClose,
}: DocumentFilterProps<TData>) {
  const statusColumn = table.getColumn('status')
  const projectColumn = table.getColumn('projectName')
  const categoriesColumn = table.getColumn('categories')
  const dateColumn = table.getColumn('createdAt')

  const [status, setStatus] = React.useState<string>(
    () => (statusColumn?.getFilterValue() as string) || 'all',
  )
  const [projectId, setProjectId] = React.useState<string>(
    () => (projectColumn?.getFilterValue() as string) || 'all',
  )
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>(
    () => (categoriesColumn?.getFilterValue() as number[]) || [],
  )
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => dateColumn?.getFilterValue() as DateRange,
  )

  const applyFilters = () => {
    // Status
    statusColumn?.setFilterValue(status === 'all' ? undefined : status)

    // Project - We match by Name in the client-side filter sinceprojectName is the secondary text
    const selectedProject = projects.find(p => p.id === projectId)
    projectColumn?.setFilterValue(projectId === 'all' ? undefined : selectedProject?.name)

    // Categories
    categoriesColumn?.setFilterValue(
      selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    )

    // Date
    dateColumn?.setFilterValue(dateRange)

    onClose?.()
  }

  const resetFilters = () => {
    setStatus('all')
    setProjectId('all')
    setSelectedCategoryIds([])
    setDateRange(undefined)

    statusColumn?.setFilterValue(undefined)
    projectColumn?.setFilterValue(undefined)
    categoriesColumn?.setFilterValue(undefined)
    dateColumn?.setFilterValue(undefined)
  }

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id],
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <FieldSet className="flex-1 space-y-4 overflow-y-auto pr-2">
        <Field>
          <FieldLabel>Projeto</FieldLabel>
          <FieldContent>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Todos os Projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Projetos</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Categorias</FieldLabel>
          <FieldContent>
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[80px] bg-muted/5">
              {categories.map(cat => {
                const isSelected = selectedCategoryIds.includes(cat.id)
                return (
                  <Badge
                    key={cat.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                )
              })}
              {categories.length === 0 && (
                <span className="text-[10px] text-muted-foreground italic">
                  Nenhuma categoria encontrada
                </span>
              )}
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Data de Criação</FieldLabel>
          <FieldContent>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
              showClear
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Status do Documento</FieldLabel>
          <FieldContent>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Draft">Rascunho</SelectItem>
                <SelectItem value="Completed">Concluído</SelectItem>
                <SelectItem value="Published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </FieldSet>

      <div className="space-y-4 py-8">
        <Separator />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 gap-2 h-10" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button className="flex-1 gap-2 h-10" onClick={applyFilters}>
            <Check className="h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
