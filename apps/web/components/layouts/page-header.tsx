'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SearchForm } from '@/components/search/search'

export interface BreadcrumbItemProps {
  label: string
  href?: string
}

export interface PageHeaderProps {
  breadcrumbs: BreadcrumbItemProps[]
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  const pathname = usePathname()
  const isDocs = pathname?.startsWith('/docs')

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 max-w-full overflow-hidden">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1
                const itemClasses = cn(
                  !isLast &&
                    'text-muted-foreground/60 hidden sm:block text-[10px] sm:text-xs truncate max-w-[100px] md:max-w-[150px]',
                  isLast &&
                    'font-medium text-[10px] sm:text-xs truncate max-w-[120px] md:max-w-none',
                )

                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem className={itemClasses}>
                      {isLast ? (
                        <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                      ) : item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="truncate">
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="cursor-default truncate">{item.label}</span>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="text-muted-foreground/30 hidden sm:block shrink-0" />
                    )}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {isDocs && (
        <div className="flex items-center shrink-1 ml-auto">
          <SearchForm className="w-full sm:w-48 lg:w-64 xl:w-72" />
        </div>
      )}
    </header>
  )
}
