import * as React from 'react'
import { PageHeader } from '@/components/page-header'

interface AdminPageLayoutProps {
  screenName: string
  /** Optional href for the screenName breadcrumb if it should be clickable */
  screenHref?: string
  stats?: React.ReactNode
  children: React.ReactNode
}

/**
 * Standard layout wrapper for admin list pages.
 * Renders: PageHeader + optional 3-column stats grid + main content slot.
 */
export function AdminPageLayout({ screenName, screenHref, stats, children }: AdminPageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        breadcrumbs={[{ label: 'Administrador' }, { label: screenName, href: screenHref }]}
      />

      {stats && <div className="grid gap-4 md:grid-cols-3">{stats}</div>}

      {children}
    </div>
  )
}
