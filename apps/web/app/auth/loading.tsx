import { Skeleton } from '@/components/ui/skeleton'
import { FieldGroup } from '@/components/ui/field'
import * as React from 'react'

export default function AuthLoading() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
      <FieldGroup>
        <div className="flex flex-col gap-1 text-left">
          {/* Title Skeleton */}
          <Skeleton className="h-8 w-3/4" />
          {/* Subtitle Skeleton */}
          <Skeleton className="h-4 w-full mt-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {/* Input Field 1 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Input Field 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full mt-2" />

        {/* Footer Link Skeleton */}
        <div className="flex justify-center mt-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </FieldGroup>
    </div>
  )
}
