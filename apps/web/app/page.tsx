export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video animate-pulse rounded-xl bg-muted/50" />
          <div className="aspect-video animate-pulse rounded-xl bg-muted/50" />
          <div className="aspect-video animate-pulse rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-full flex-1 rounded-xl bg-muted/50 md:min-h-min animate-pulse" />
      </div>
    </>
  )
}
