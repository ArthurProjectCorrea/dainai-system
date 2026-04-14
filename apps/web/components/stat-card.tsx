'use client'

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden transition-all hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-emerald-500' : 'text-rose-500',
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover/card:bg-primary group-hover/card:text-primary-foreground',
              iconClassName,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover/card:bg-primary/10" />
      </CardContent>
    </Card>
  )
}
