'use client'

import * as React from 'react'

export default function AuthLoading() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        {/* Title Skeleton */}
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
        {/* Subtitle Skeleton */}
        <div className="h-4 w-64 bg-muted/60 rounded-md animate-pulse" />
      </div>

      <div className="space-y-6">
        {/* Input Field 1 */}
        <div className="space-y-2">
          <div className="h-4 w-12 bg-muted/80 rounded animate-pulse" />
          <div className="h-10 w-full bg-muted/40 rounded-md border border-muted animate-pulse" />
        </div>

        {/* Input Field 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-12 bg-muted/80 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-muted/40 rounded-md border border-muted animate-pulse" />
        </div>

        {/* Button Skeleton */}
        <div className="h-10 w-full bg-sidebar-primary/20 rounded-md animate-pulse" />
      </div>

      {/* Footer Link Skeleton */}
      <div className="flex justify-center">
        <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
      </div>
    </div>
  )
}
