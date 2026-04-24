'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FieldGroup } from '@/components/ui/field'

interface CompactFormLayoutProps extends React.ComponentProps<'form'> {
  title: string
  description?: string
  contextText?: string
  submitLabel: string
  isPending?: boolean
  footer?: React.ReactNode
  headerExtra?: React.ReactNode
  children: React.ReactNode
}

export function CompactFormLayout({
  title,
  description,
  contextText,
  submitLabel,
  isPending,
  footer,
  headerExtra,
  children,
  className,
  ...props
}: CompactFormLayoutProps) {
  return (
    <form
      className={cn(
        'flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500',
        className,
      )}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-balance text-muted-foreground">{description}</p>
          )}
          {contextText && (
            <span className="text-sm font-medium text-primary underline underline-offset-4 decoration-primary/30">
              {contextText}
            </span>
          )}
          {headerExtra && <div className="mt-3">{headerExtra}</div>}
        </div>

        <div className="flex flex-col gap-4">{children}</div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              {submitLabel.endsWith('ar') || submitLabel.endsWith('ir')
                ? submitLabel.replace(/r$/, 'ndo...')
                : 'Processando...'}
            </>
          ) : (
            submitLabel
          )}
        </Button>

        {footer && <div className="flex justify-center">{footer}</div>}
      </FieldGroup>
    </form>
  )
}
