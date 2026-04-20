import { PageHeader } from '@/components/page-header'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumbs={[{ label: 'Introdução' }]} />

      <div className="flex-1 flex flex-col gap-8 p-6 lg:p-10 w-full animate-pulse">
        {/* Welcome Header Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-48 bg-muted/40 rounded-lg" />
          <div className="h-6 w-full max-w-2xl bg-muted/20 rounded-md" />
          <div className="h-6 w-full max-w-xl bg-muted/20 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Summary Card Skeleton */}
          <div className="lg:col-span-8">
            <div className="h-[400px] w-full bg-muted/30 rounded-2xl ring-1 ring-border" />
          </div>

          {/* Updates Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="h-6 w-40 bg-muted/40 rounded-md" />
              <div className="h-5 w-20 bg-muted/20 rounded-full" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-24 w-full bg-muted/20 rounded-xl border border-muted/30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
