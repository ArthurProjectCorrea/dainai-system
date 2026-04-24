'use client'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layouts/page-header'
import { ProjectDashboardSection } from '@/components/chart/project-chart'
import { DocumentDashboardSection } from '@/components/chart/document-chart'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { SparklesIcon } from 'lucide-react'

export default function DashboardPage() {
  const { hasPermission } = useAuth()

  const canViewProjects = hasPermission('projects_management', 'view')
  const canViewDocuments = hasPermission('documents_management', 'view')

  return (
    <div className="flex flex-1 flex-col relative pb-10">
      <PageHeader breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }]} />

      <div className="px-6 flex flex-col gap-10 mt-10 overflow-x-hidden">
        {/* Main Section: Projects Analysis */}
        {canViewProjects && (
          <>
            <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <ProjectDashboardSection />
            </section>
            <Separator className="opacity-50" />
          </>
        )}

        {/* Documentation Analysis Section */}
        {canViewDocuments && (
          <>
            <section className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
              <DocumentDashboardSection />
            </section>
            <Separator className="opacity-50" />
          </>
        )}

        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <SparklesIcon className="size-3" />
              Novidades em breve
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2 italic">
              Estamos preparando algo novo
            </h3>
            <p className="text-sm text-muted-foreground max-w-md italic">
              Nossa equipe está trabalhando em novas métricas e visualizações para outros módulos do
              sistema. Fique atento!
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full opacity-40 grayscale pointer-events-none">
              <Card className="border-dashed h-24 flex items-center justify-center">
                <span className="text-xs font-bold uppercase italic tracking-tighter">
                  Módulo de Auditoria
                </span>
              </Card>
              <Card className="border-dashed h-24 flex items-center justify-center">
                <span className="text-xs font-bold uppercase italic tracking-tighter">
                  Fluxo de Usuários
                </span>
              </Card>
              <Card className="border-dashed h-24 flex items-center justify-center">
                <span className="text-xs font-bold uppercase italic tracking-tighter">
                  Insights de IA
                </span>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
