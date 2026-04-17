import { Table } from '@tanstack/react-table'

export type QuickFilterType = 'text' | 'select' | 'date' | 'daterange'

export interface QuickFilterConfig {
  type: QuickFilterType
  column: string
  label?: string
  options?: { label: string; value: string }[]
  placeholder?: string
}

export interface DetailedFilterConfig<TData = unknown> {
  component: React.ComponentType<{ table: Table<TData>; onClose?: () => void }>
  label?: string
}

export interface DataTableFilterBarProps<TData> {
  table?: Table<TData>
  quickFilter?: QuickFilterConfig
  detailedFilter?: DetailedFilterConfig<TData>
  onReload?: () => void
  onFilterChange?: (column: string, value: unknown) => void
}
