'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useFormLayoutContext } from '@/components/layouts/form-layout'

interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  hideTitleInDialog?: boolean
}

export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
  hideTitleInDialog,
}: FormSectionProps) {
  const { variant } = useFormLayoutContext()

  if (variant === 'dialog') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {!hideTitleInDialog && (title || description) && (
          <div className="space-y-1">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    )
  }

  return (
    <Card className={cn('shadow-sm overflow-hidden', className)}>
      {(title || description) && (
        <CardHeader className="pb-3 px-4 md:px-6">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent
        className={cn(
          'px-4 md:px-6 py-4',
          title || description ? 'pt-0' : 'pt-6',
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}

export function FormGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { variant } = useFormLayoutContext()

  if (variant === 'dialog') {
    return <div className={cn('flex flex-col gap-6', className)}>{children}</div>
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6 items-start', className)}>
      {children}
    </div>
  )
}
