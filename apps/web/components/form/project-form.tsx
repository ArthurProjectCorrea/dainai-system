'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Building2, CopyIcon, RotateCw } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { FormLayout } from '@/components/layouts/form-layout'
import { FormSection, FormGrid } from '@/components/form-section'
import { cn } from '@/lib/utils'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

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
import { getTeamsAction } from '@/lib/action/team-actions'
import {
  createProjectAction,
  updateProjectAction,
  rotateProjectTokenAction,
} from '@/lib/action/project-actions'
import { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types/project'
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
  isDialog?: boolean
  onEdit?: () => void
}

export function ProjectForm({
  data,
  onSuccess,
  onCancel,
  readOnly,
  isDialog,
  onEdit,
}: ProjectFormProps) {
  const { activeAccesses, activeTeamId, activeTeamName, hasPermission } = useAuth()
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
      if (!canChangeTeam) {
        setFetchingTeams(false)
        return
      }

      try {
        const result = await getTeamsAction()
        if (result.data) {
          setTeams(result.data)
        } else if (result.error) {
          toast.error(result.error)
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setFetchingTeams(false)
      }
    }
    fetchTeams()
  }, [canChangeTeam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = isEdit
        ? await updateProjectAction(data!.id, {
            name,
            teamId,
            isActive,
          } as UpdateProjectRequest)
        : await createProjectAction({
            name,
            teamId,
          } as CreateProjectRequest)

      if (result.error) {
        throw new Error(result.error)
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
      const result = await rotateProjectTokenAction(data!.id)
      if (result.error) throw new Error(result.error)

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

  const basicFields = (
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
          <div className="h-10 flex items-center px-3 border rounded-md bg-muted/20 cursor-not-allowed opacity-80">
            <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {data?.teamName || activeTeamName || 'Equipe Principal'}
            </span>
          </div>
        ) : fetchingTeams ? (
          <div className="h-10 flex items-center px-3 border rounded-md bg-muted/20">
            {/* Using raw spinner as text here or keep consistent */}
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
  )

  return (
    <form id="project-form" onSubmit={handleSubmit} className="flex flex-col relative h-full">
      <FormLayout
        title={!isEdit ? 'Novo Projeto' : data?.name || 'Projeto'}
        description={
          !isEdit
            ? 'Crie uma nova central de feedbacks para seus usuários'
            : 'Gestão de integrações e estatísticas do projeto'
        }
        mode={readOnly ? 'view' : isEdit ? 'edit' : 'create'}
        loading={loading}
        onCancel={onCancel || (() => window.history.back())}
        variant={{
          create: 'dialog',
          edit: 'page',
          view: 'page',
        }}
        onEdit={onEdit}
        formId="project-form"
      >
        <FormGrid className={cn(!isEdit || isDialog ? 'lg:grid-cols-1' : 'lg:grid-cols-2')}>
          {/* Left Column: Form & Integration */}
          <div className="flex flex-col gap-6">
            <FormSection title="Dados do Projeto" hideTitleInDialog>
              {basicFields}
            </FormSection>

            {/* Integration Section - Only in Edit mode */}
            {!isDialog && isEdit && (
              <FormSection
                title="Integração (API)"
                description="Chave utilizada para invocar o Webhook Público via header x-project-token."
                className="flex-1"
              >
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
                            <RotateCw className="h-3 w-3 animate-spin" />
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
              </FormSection>
            )}
          </div>

          {/* Right Column: Statistics - Only in Page mode and Edit mode */}
          {!isDialog && isEdit && (
            <FormSection
              title="Perfil de Avaliações"
              description="Distribuição por nota (1 a 5)"
              className="h-full"
              contentClassName="flex flex-col justify-between"
            >
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
            </FormSection>
          )}
        </FormGrid>
      </FormLayout>
    </form>
  )
}
