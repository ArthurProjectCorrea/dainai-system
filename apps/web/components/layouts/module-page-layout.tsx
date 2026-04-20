import * as React from 'react'
import { PageHeader } from '@/components/page-header'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ModulePageLayoutProps {
  breadcrumbItems: BreadcrumbItem[]
  stats?: React.ReactNode
  children: React.ReactNode
}

/**
 * Standard layout wrapper for module pages.
 * Renders: PageHeader + optional 3-column stats grid + main content slot.
 */
export function ModulePageLayout({ breadcrumbItems, stats, children }: ModulePageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumbs={breadcrumbItems} />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {stats && <div className="grid gap-4 md:grid-cols-3 mt-4 pt-1">{stats}</div>}

        {children}
      </div>
    </div>
  )
}
