'use client'

import * as React from 'react'
import { Label, Pie, PieChart, Sector, type SectorProps } from 'recharts'
import {
  FolderIcon,
  MessageSquareIcon,
  StarIcon,
  ActivityIcon,
  ShieldAlertIcon,
  TrophyIcon,
  MedalIcon,
  TrendingUp,
  Smile,
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
import { StatCard } from '@/components/ui/stat-card'
import { cn } from '@/lib/utils'

interface ProjectDashboardData {
  stats: {
    totalProjects: number
    activeProjects: number
    totalFeedbacks: number
    averageRating: number
  }
  ratingDistribution: Array<{ rating: number; count: number }>
  topProjects: Array<{ projectName: string; averageNote: number; totalFeedbacks: number }>
}

const chartConfig = {
  count: {
    label: 'Quantidade',
  },
  rating1: { label: '1 Estrela', color: '#dc2626' }, // Red 600
  rating2: { label: '2 Estrelas', color: '#f87171' }, // Red 400
  rating3: { label: '3 Estrelas', color: '#f97316' }, // Orange 500
  rating4: { label: '4 Estrelas', color: '#4ade80' }, // Green 400
  rating5: { label: '5 Estrelas', color: '#16a34a' }, // Green 600
} satisfies ChartConfig

export function ProjectDashboardSection() {
  const { hasPermission, user, activeTeamId } = useAuth()
  const [data, setData] = React.useState<ProjectDashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const canView = hasPermission('projects_management', 'view')

  React.useEffect(() => {
    if (!canView) {
      setLoading(false)
      return
    }

    async function fetchDashboard() {
      try {
        const response = await fetch('/api/v1/dashboard/projects', {
          headers: {
            'x-user-id': user?.id || '',
            'x-active-team-id': activeTeamId || '',
          },
        })

        if (!response.ok) throw new Error('Falha ao carregar dashboard de projetos')

        const result = await response.json()
        setData(result.data)
      } catch (err: unknown) {
        const error = err as Error
        console.error('Error fetching project dashboard:', error)
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
          <Skeleton className="md:col-span-4 h-[28rem] rounded-xl" />
          <Skeleton className="md:col-span-3 h-[28rem] rounded-xl" />
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
            <CardTitle className="text-destructive">Erro no Módulo de Projetos</CardTitle>
            <CardDescription>{error}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ProjectDashboardCharts
        data={data}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </div>
  )
}

function ProjectDashboardCharts({
  data,
  activeIndex,
  setActiveIndex,
}: {
  data: ProjectDashboardData
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
}) {
  // Map distribution labels and colors
  const distributionData = React.useMemo(() => {
    const defaultColors: Record<number, string> = {
      1: chartConfig.rating1.color,
      2: chartConfig.rating2.color,
      3: chartConfig.rating3.color,
      4: chartConfig.rating4.color,
      5: chartConfig.rating5.color,
    }

    // Ensure all 1-5 ratings exist for the chart even if count is 0
    return [1, 2, 3, 4, 5]
      .map(rating => {
        const found = data.ratingDistribution.find(d => d.rating === rating)
        return {
          rating: `${rating} Estrelas`,
          count: found?.count || 0,
          fill: defaultColors[rating],
        }
      })
      .filter(d => d.count > 0) // Only show ratings that have feedbacks to keep it clean
  }, [data.ratingDistribution])

  return (
    <div className="space-y-6 pt-1">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Projetos"
          value={data.stats.totalProjects}
          icon={<FolderIcon className="h-4 w-4 text-primary" />}
          description="Projetos sob seu escopo"
        />
        <StatCard
          title="Total de Feedbacks"
          value={data.stats.totalFeedbacks}
          icon={<MessageSquareIcon className="h-4 w-4 text-blue-500" />}
          description="Capturados globalmente"
        />
        <StatCard
          title="Média Global"
          value={data.stats.averageRating.toFixed(1)}
          icon={<StarIcon className="h-4 w-4 text-yellow-500" />}
          description="NPS Geral do Sistema"
        />
        <StatCard
          title="Projetos Ativos"
          value={data.stats.activeProjects}
          icon={<ActivityIcon className="h-4 w-4 text-emerald-500" />}
          description="Em operação no momento"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Donut Chart (Pie) for Distribution */}
        <Card className="md:col-span-4 flex flex-col shadow-sm border-muted/40">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Smile className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg">Distribuição de Satisfação</CardTitle>
                <CardDescription>Notas atribuídas nos últimos feedbacks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full">
              {/* Chart on the left */}
              <ChartContainer config={chartConfig} className="w-full max-w-60 aspect-square">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={distributionData}
                    dataKey="count"
                    nameKey="rating"
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
                                {data.stats.averageRating.toFixed(1)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-xs uppercase font-bold tracking-tighter"
                              >
                                Média Geral
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Custom Legend on the right */}
              <div className="flex flex-col gap-3 min-w-40">
                {distributionData
                  .slice()
                  .reverse()
                  .map((item, index) => {
                    const actualIndex = distributionData.length - 1 - index
                    const isHovered = activeIndex === actualIndex

                    return (
                      <div
                        key={item.rating}
                        className={cn(
                          'flex items-center justify-between gap-4 p-2 rounded-lg transition-all duration-200',
                          isHovered ? 'bg-muted/50 scale-105' : 'opacity-80',
                        )}
                        onMouseEnter={() => setActiveIndex(actualIndex)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="size-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-xs font-bold uppercase tracking-wider italic">
                            {item.rating}
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
            <div className="flex items-center gap-2 leading-none font-medium text-primary">
              {data.stats.totalFeedbacks} feedbacks processados <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground italic text-xs uppercase tracking-wider opacity-70">
              Cores representam o nível de satisfação (Vermelho a Verde)
            </div>
          </CardFooter>
        </Card>

        {/* Elite de Performance Ranking */}
        <Card className="md:col-span-3 flex flex-col shadow-sm border-muted/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-600">
                <TrophyIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg">Elite de Performance</CardTitle>
                <CardDescription>Ranking dos projetos com maior aprovação</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {data.topProjects.length > 0 ? (
                data.topProjects.map((project, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border border-transparent transition-all hover:bg-muted/50 hover:border-muted',
                      i === 0 && 'bg-primary/5 border-primary/10 shadow-sm',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex items-center justify-center size-8 rounded-full text-sm font-bold shadow-sm shrink-0',
                          i === 0
                            ? 'bg-yellow-500 text-white'
                            : i === 1
                              ? 'bg-slate-300 text-slate-700'
                              : i === 2
                                ? 'bg-amber-600/20 text-amber-700'
                                : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {i === 0 ? <MedalIcon className="size-4" /> : i + 1}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold leading-none truncate max-w-36">
                          {project.projectName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.totalFeedbacks} avaliações
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-primary">
                          {project.averageNote.toFixed(1)}
                        </span>
                        <StarIcon className="size-3 fill-yellow-500 text-yellow-500" />
                      </div>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(project.averageNote / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm italic">
                  Nenhum dado de feedback disponível.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground uppercase tracking-widest text-center border-none bg-transparent opacity-70">
            Atualizado em tempo real
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
