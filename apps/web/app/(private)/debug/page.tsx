'use client'

import { PageHeader } from '@/components/page-header'
import { useAuth } from '@/hooks/use-auth'

export default function DebugPage() {
  const { user, activeTeamName, activePosition, activePermissionsByScreen } = useAuth()

  return (
    <>
      <PageHeader breadcrumbs={[{ label: 'Debug' }]} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Team ativo</p>
            <p className="mt-2 text-lg font-semibold">{activeTeamName ?? 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{activePosition ?? 'N/A'}</p>
          </div>
          <div className="rounded-xl border bg-background p-4 shadow-sm md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Permissões por screen</p>
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(activePermissionsByScreen, null, 2)}
            </pre>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Profile</p>
            <pre className="mt-3 max-h-[32rem] overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(user?.profile ?? null, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Accesses / Teams</p>
            <pre className="mt-3 max-h-[32rem] overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(
                {
                  teamAccesses: user?.teamAccesses ?? [],
                  teams: user?.teams ?? [],
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </>
  )
}
