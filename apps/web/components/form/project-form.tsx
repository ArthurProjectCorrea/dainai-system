'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Building2, RotateCw, CopyIcon } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts'

import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { FormHeader } from '@/components/form-header'
import { FormButtons } from '@/components/form-buttons'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project'
import type { Team } from '@/types/team'

const chartConfig = {
  count: {
    label: 'Feedbacks',
    color: 'hsl(var(--primary))',
  },
}

interface ProjectFormProps {
  data?: Project | null
  onSuccess?: () => void
  onCancel?: () => void
  readOnly?: boolean
}

export function ProjectForm({ data, onSuccess, onCancel, readOnly }: ProjectFormProps) {
  const { activeAccesses, activeTeamId, hasPermission } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [teams, setTeams] = React.useState<Team[]>([])
  const [fetchingTeams, setFetchingTeams] = React.useState(true)

  // Form State
  const [name, setName] = React.useState(data?.name || '')
  const [teamId, setTeamId] = React.useState(data?.teamId || activeTeamId || '')
  const [isActive, setIsActive] = React.useState(data?.isActive ?? true)

  // Token & Integration State
  const [rawToken, setRawToken] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const isEdit = !!data
  const canUpdate = hasPermission('projects_management', 'update')

  const projectAccess = activeAccesses.find(a => a.nameKey === 'projects_management')
  const scope = projectAccess?.scope || 'team'
  const canChangeTeam = scope === 'all'

  React.useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch('/api/v1/admin/teams')
        if (res.ok) {
          const result = await res.json()
          setTeams(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setFetchingTeams(false)
      }
    }
    fetchTeams()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/v1/admin/projects/${data.id}` : '/api/v1/admin/projects'
      const method = isEdit ? 'PUT' : 'POST'

      const body: CreateProjectRequest | UpdateProjectRequest = isEdit
        ? { name, teamId, isActive }
        : { name, teamId }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Falha ao salvar projeto')
      }

      toast.success(isEdit ? 'Projeto atualizado!' : 'Projeto criado!')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar projeto')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateToken = async () => {
    if (!data?.id) return

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/v1/admin/projects/${data.id}/rotate-token`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Falha ao gerar nova chave')
      const result = await response.json()
      setRawToken(result.data.integrationToken)
      toast.success('Chave gerada com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar token')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToken = () => {
    if (!rawToken) return
    navigator.clipboard.writeText(rawToken)
    toast.success('Chave copiada!')
  }

  // Transform scoreDistribution to chart data
  const transformedChartData = React.useMemo(() => {
    const scores = [1, 2, 3, 4, 5]
    return scores.map(score => ({
      score: `Nota ${score}`,
      count: data?.scoreDistribution?.[score] || 0,
    }))
  }, [data?.scoreDistribution])

  return (
    <form id="project-form" onSubmit={handleSubmit} className="flex flex-col relative min-h-full">
      <FormHeader
        title={!isEdit ? 'Novo Projeto' : data?.name || 'Carregando...'}
        description={
          !isEdit
            ? 'Configuração de novo produto e central de feedbacks'
            : 'Gestão de projeto, integrações e estatísticas estratégicas'
        }
      >
        <FormButtons
          mode={readOnly ? 'view' : isEdit ? 'edit' : 'create'}
          loading={loading}
          onCancel={onCancel || (() => window.history.back())}
        />
      </FormHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-full">
        {/* Left Column: Form & Integration */}
        <div className="flex flex-col gap-6 h-full">
          {/* Basic Info Card */}
          <Card className="flex flex-col shadow-sm">
            <CardHeader className="pb-3 px-4 md:px-6">
              <CardTitle>Dados do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <FieldGroup className="grid gap-6 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Nome do Projeto</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: App Portal..."
                    required
                    disabled={readOnly}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="teamId">Equipe Responsável</FieldLabel>
                  {!canChangeTeam ? (
                    <div className="h-8 flex items-center px-2.5 border rounded-lg bg-input/20 cursor-not-allowed opacity-80">
                      <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="text-xs">{data?.teamName || 'Carregando...'}</span>
                    </div>
                  ) : fetchingTeams ? (
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted/20">
                      <Spinner className="h-3 w-3 mr-2" />
                      <span className="text-xs text-muted-foreground">Carregando...</span>
                    </div>
                  ) : (
                    <Select value={teamId} onValueChange={setTeamId} disabled={readOnly}>
                      <SelectTrigger id="teamId">
                        <SelectValue placeholder="Selecione uma equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>

                <FieldLabel htmlFor="isActive" className="md:col-span-2">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Status do Projeto</FieldTitle>
                      <FieldDescription>
                        Define se o projeto está ativo para coleta de feedbacks.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      disabled={readOnly}
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Integration Card */}
          {isEdit && (
            <Card className="flex flex-col shadow-sm flex-1">
              <CardHeader className="pb-3 px-4 md:px-6">
                <CardTitle>Integração (API)</CardTitle>
                <CardDescription className="text-xs">
                  Chave utilizada para invocar o Webhook Público via header{' '}
                  <code className="bg-muted px-1 rounded font-mono text-[10px]">
                    x-project-token
                  </code>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                {rawToken ? (
                  <Alert className="bg-muted/50 border-muted">
                    <AlertTitle className="text-sm font-bold">Token Gerado</AlertTitle>
                    <AlertDescription className="mt-2 text-xs flex items-center gap-2">
                      <code className="bg-background border rounded px-2 py-1 flex-1 font-mono text-[10px] truncate">
                        {rawToken}
                      </code>
                      <Button
                        onClick={copyToken}
                        size="sm"
                        variant="secondary"
                        className="h-7 px-3"
                      >
                        <CopyIcon className="h-3 w-3 mr-2" />
                        Copiar
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg bg-muted/5">
                    <p className="text-[11px] text-muted-foreground mb-4">
                      A chave fica oculta após a geração inicial por segurança.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          disabled={isGenerating || !canUpdate || readOnly}
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2"
                        >
                          {isGenerating ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            <RotateCw className="h-3 w-3" />
                          )}
                          Gerar Nova Chave
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao gerar uma nova chave, a integração atual parará de funcionar
                            imediatamente. Você precisará atualizar o token em todos os seus
                            webhooks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Agora não</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleGenerateToken}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Sim, rotacionar chave
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Statistics */}
        {isEdit && (
          <div className="flex flex-col h-full">
            <Card className="flex flex-col h-full shadow-sm">
              <CardHeader className="pb-4 px-4 items-center text-center">
                <CardTitle>Perfil de Avaliações</CardTitle>
                <CardDescription className="text-[10px]">
                  Distribuição por nota (1 a 5)
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-6 flex-1 flex flex-col justify-between gap-6">
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-h-[350px]"
                  >
                    <RadarChart data={transformedChartData}>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <PolarGrid gridType="circle" radialLines={false} />
                      <PolarAngleAxis dataKey="score" tick={{ fontSize: 10 }} />
                      <Radar
                        dataKey="count"
                        fill="var(--color-count)"
                        fillOpacity={0.6}
                        dot={{
                          r: 4,
                          fillOpacity: 1,
                        }}
                      />
                    </RadarChart>
                  </ChartContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t mt-auto">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-wider opacity-60">
                      Total Capturado
                    </FieldLabel>
                    <div className="text-xl font-bold">{data?.totalFeedbacks || 0}</div>
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-wider opacity-60">
                      Média Global
                    </FieldLabel>
                    <div className="text-xl font-bold">
                      {data && data.averageFeedbackNote > 0
                        ? data.averageFeedbackNote.toFixed(1)
                        : '0.0'}
                    </div>
                  </Field>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </form>
  )
}
