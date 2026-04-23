import { Skeleton } from '@/components/ui/skeleton'
import * as React from 'react'

export default function AuthLoading() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        {/* Title Skeleton */}
        <Skeleton className="h-8 w-48" />
        {/* Subtitle Skeleton */}
        <Skeleton className="h-4 w-64 opacity-60" />
      </div>

      <div className="space-y-6">
        {/* Input Field 1 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 opacity-80" />
          <Skeleton className="h-10 w-full rounded-md border border-muted opacity-40" />
        </div>

        {/* Input Field 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12 opacity-80" />
            <Skeleton className="h-4 w-32 opacity-30" />
          </div>
          <Skeleton className="h-10 w-full rounded-md border border-muted opacity-40" />
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full bg-sidebar-primary/20" />
      </div>

      {/* Footer Link Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-24 opacity-40" />
      </div>
    </div>
  )
}
