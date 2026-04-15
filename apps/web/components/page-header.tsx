'use client'

import * as React from 'react'
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

export interface BreadcrumbItemProps {
  label: string
  href?: string
}

export interface PageHeaderProps {
  breadcrumbs: BreadcrumbItemProps[]
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-2">
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
                !isLast && 'text-muted-foreground/60 hidden md:block',
                isLast && 'font-medium',
              )

              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem className={itemClasses}>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
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
    </header>
  )
}
