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
import { SearchForm } from '@/components/search'

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
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const itemClasses = cn(
                !isLast && 'text-muted-foreground/60 hidden md:block text-xs',
                isLast && 'font-medium text-xs',
              )

              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem className={itemClasses}>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className="cursor-default">{item.label}</span>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="text-muted-foreground/30 hidden md:block" />
                  )}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {isDocs && (
        <div className="flex items-center">
          <SearchForm className="w-full sm:w-[250px] lg:w-[350px]" />
        </div>
      )}
    </header>
  )
}
