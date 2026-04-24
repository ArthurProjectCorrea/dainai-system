import { PageHeader } from '@/components/layouts/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumbs={[{ label: 'Introdução' }]} />

      <div className="flex-1 flex flex-col gap-8 p-6 lg:p-10 w-full">
        {/* Welcome Header Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 opacity-40 rounded-lg" />
          <Skeleton className="h-6 w-full max-w-2xl opacity-20" />
          <Skeleton className="h-6 w-full max-w-xl opacity-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Summary Card Skeleton */}
          <div className="lg:col-span-8">
            <Skeleton className="h-[400px] w-full opacity-30 rounded-2xl ring-1 ring-border" />
          </div>

          {/* Updates Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-6 w-40 opacity-40" />
              <Skeleton className="h-5 w-20 opacity-20 rounded-full" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton
                  key={i}
                  className="h-24 w-full opacity-20 rounded-xl border border-muted/30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
