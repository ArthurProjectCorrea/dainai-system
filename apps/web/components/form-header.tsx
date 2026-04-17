'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface FormHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function FormHeader({ title, description, children, className }: FormHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-30 bg-background -mx-4 px-4 py-4 border-b mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4',
        className,
      )}
    >
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium opacity-70">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}
