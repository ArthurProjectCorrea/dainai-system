'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface DataTableMobileSkeletonProps {
  rowCount?: number
}

export function DataTableMobileSkeleton({ rowCount = 3 }: DataTableMobileSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card shadow-md overflow-hidden animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>

          {/* Content Skeleton */}
          <div className="divide-y divide-border/30 bg-card/50">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex justify-between items-center px-5 py-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          {/* Footer/Button Skeleton */}
          <div className="h-11 border-t border-border/20 flex items-center justify-center">
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
