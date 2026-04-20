'use client'

import * as React from 'react'
import { Label, Pie, PieChart, Sector, type SectorProps } from 'recharts'
import {
  FileTextIcon,
  CheckCircle2Icon,
  FileEditIcon,
  TagsIcon,
  ShieldAlertIcon,
  BarChart3Icon,
  HistoryIcon,
  TrendingUp,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { StatCard } from '@/components/stat-card'
import { cn } from '@/lib/utils'

interface DocumentDashboardData {
  stats: {
    totalDocuments: number
    publishedCount: number
    draftCount: number
    totalCategories: number
  }
  statusDistribution: Array<{ status: string; count: number }>
  topProjects: Array<{ projectName: string; documentCount: number }>
}

const chartConfig = {
  count: {
    label: 'Quantidade',
  },
  published: { label: 'Publicados', color: '#16a34a' }, // Emerald 600
  draft: { label: 'Rascunhos', color: '#ea580c' }, // Orange 600
  completed: { label: 'Concluídos', color: '#0284c7' }, // Sky 600
} satisfies ChartConfig

export function DocumentDashboardSection() {
  const { hasPermission, user, activeTeamId } = useAuth()
  const [data, setData] = React.useState<DocumentDashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const canView = hasPermission('documents_management', 'view')

  React.useEffect(() => {
    if (!canView) {
      setLoading(false)
      return
    }

    async function fetchDashboard() {
      try {
        const response = await fetch('/api/v1/dashboard/documents', {
          headers: {
            'x-user-id': user?.id || '',
            'x-active-team-id': activeTeamId || '',
          },
        })

        if (!response.ok) throw new Error('Falha ao carregar dashboard de documentos')

        const result = await response.json()
        setData(result.data)
      } catch (err: unknown) {
        const error = err as Error
        console.error('Error fetching document dashboard:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [canView, user?.id, activeTeamId])

  if (!canView) return null

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="md:col-span-4 h-[450px] rounded-xl" />
          <Skeleton className="md:col-span-3 h-[450px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="flex-row items-center gap-4">
          <ShieldAlertIcon className="h-8 w-8 text-destructive" />
          <div>
            <CardTitle className="text-destructive">Erro no Módulo de Documentos</CardTitle>
            <CardDescription>{error}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DocumentDashboardCharts
        data={data}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </div>
  )
}

function DocumentDashboardCharts({
  data,
  activeIndex,
  setActiveIndex,
}: {
  data: DocumentDashboardData
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
}) {
  const distributionData = React.useMemo(() => {
    const statusColors: Record<string, string> = {
      Published: chartConfig.published.color,
      Draft: chartConfig.draft.color,
      Completed: chartConfig.completed.color,
    }

    const statusLabels: Record<string, string> = {
      Published: 'Publicados',
      Draft: 'Rascunhos',
      Completed: 'Concluídos',
    }

    return data.statusDistribution
      .map(item => ({
        status: statusLabels[item.status] || item.status,
        count: item.count,
        fill: statusColors[item.status] || '#cbd5e1',
      }))
      .filter(d => d.count > 0)
  }, [data.statusDistribution])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Documentos"
          value={data.stats.totalDocuments}
          icon={<FileTextIcon className="h-4 w-4 text-primary" />}
          description="Volume total de conhecimento"
        />
        <StatCard
          title="Documentos Publicados"
          value={data.stats.publishedCount}
          icon={<CheckCircle2Icon className="h-4 w-4 text-emerald-500" />}
          description="Visíveis para os usuários"
        />
        <StatCard
          title="Em Rascunho"
          value={data.stats.draftCount}
          icon={<FileEditIcon className="h-4 w-4 text-orange-500" />}
          description="Conteúdo em elaboração"
        />
        <StatCard
          title="Total de Categorias"
          value={data.stats.totalCategories}
          icon={<TagsIcon className="h-4 w-4 text-blue-500" />}
          description="Tags de organização ativas"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Status Distribution Donut */}
        <Card className="md:col-span-4 flex flex-col shadow-sm border-muted/40">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BarChart3Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg">Status do Conhecimento</CardTitle>
                <CardDescription>Ciclo de vida atual da documentação</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full">
              <ChartContainer config={chartConfig} className="w-full max-w-[240px] aspect-square">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={distributionData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    strokeWidth={4}
                    shape={(props: SectorProps & { isActive?: boolean; index?: number }) => {
                      const { outerRadius = 0, isActive, index } = props
                      const isManualActive = activeIndex === index
                      const enlarged = isActive || isManualActive

                      return (
                        <Sector {...props} outerRadius={enlarged ? outerRadius + 8 : outerRadius} />
                      )
                    }}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-black"
                              >
                                {data.stats.totalDocuments}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-[10px] uppercase font-bold tracking-tighter"
                              >
                                Documentos
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="flex flex-col gap-3 min-w-[150px]">
                {distributionData.map((item, index) => {
                  const isHovered = activeIndex === index

                  return (
                    <div
                      key={item.status}
                      className={cn(
                        'flex items-center justify-between gap-4 p-2 rounded-lg transition-all duration-200',
                        isHovered ? 'bg-muted/50 scale-105' : 'opacity-80',
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {item.status}
                        </span>
                      </div>
                      <span className="text-xs font-black tabular-nums">{item.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm pt-0 border-none bg-transparent">
            <div className="flex items-center gap-2 leading-none font-medium text-emerald-600">
              {data.stats.publishedCount} documentos ativos <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Top Projects by Volume */}
        <Card className="md:col-span-3 flex flex-col shadow-sm border-muted/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <HistoryIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg">Projetos Produtivos</CardTitle>
                <CardDescription>Principais fontes de documentação</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {data.topProjects.length > 0 ? (
                data.topProjects.map((project, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-transparent transition-all hover:bg-muted/50 hover:border-muted"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold leading-none truncate max-w-[140px]">
                          {project.projectName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-primary">
                        {project.documentCount}
                      </span>
                      <FileTextIcon className="size-3 text-muted-foreground" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm italic">
                  Nenhum dado disponível.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
