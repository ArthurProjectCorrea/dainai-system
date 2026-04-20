'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  className?: string
}

/**
 * Premium StatCard component used globally for dashboard indicators and page stats.
 */
export function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        'shadow-sm border-muted/40 overflow-hidden relative group hover:border-primary/20 transition-colors',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">{description}</p>
        )}
      </CardContent>
      {/* Animated bottom bar indicator */}
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
    </Card>
  )
}
