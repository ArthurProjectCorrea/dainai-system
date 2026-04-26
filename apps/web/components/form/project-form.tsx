'use client'

import * as React from 'react'
import { notify } from '@/lib/notifications'
import { Copy as CopyIcon, RotateCw, Building2 } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts'
import { SidebarConfigCard } from '@/components/project/sidebar-config-card'
import { SidebarGroup } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { FormLayout } from '../layouts/form-layout'
import { FormSection, FormGrid } from '../layouts/form-section'
import { cn } from '@/lib/utils'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

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
import { getTeamsAction } from '@/lib/action/admin-action'
import {
  createProjectAction,
  updateProjectAction,
  rotateProjectTokenAction,
} from '@/lib/action/project-action'
import { CreateProjectRequest, Project, UpdateProjectRequest } from '@/types'
import type { Team } from '@/types'

const chartConfig = {
  count: {
    label: 'Feedbacks',
    color: 'var(--primary)',
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
  const [summary, setSummary] = React.useState(data?.summary || '')
  const [loading, setLoading] = React.useState(false)
  const [teams, setTeams] = React.useState<Team[]>([])
  const [fetchingTeams, setFetchingTeams] = React.useState(true)

  // Form State
  const [name, setName] = React.useState(data?.name || '')
  const [teamId, setTeamId] = React.useState(data?.teamId || activeTeamId || '')
  const [isActive, setIsActive] = React.useState(data?.isActive ?? true)
  const [sidebarConfig, setSidebarConfig] = React.useState<SidebarGroup[]>(
    data?.sidebarConfig || [],
  )

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
          notify.system.error(result.error)
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
            summary,
            sidebarConfig,
          } as UpdateProjectRequest)
        : await createProjectAction({
            name,
            teamId,
            summary,
          } as CreateProjectRequest)

      if (result.error) {
        throw new Error(result.error)
      }

      notify.admin.project.saveSuccess(isEdit)
      onSuccess?.()
    } catch (error) {
      notify.system.error('Erro ao salvar projeto')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateToken = async () => {
    if (!data?.id) return

    setIsGenerating(true)
    try {
      const result = await rotateProjectTokenAction(data!.id)
      if (result.error) {
        notify.system.error(result.error)
        return
      }
      if (result.data) {
        setRawToken(result.data.integrationToken ?? null)
      }
      notify.admin.project.tokenRotated()
    } catch (error) {
      notify.system.error('Erro ao gerar token')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToken = () => {
    if (!rawToken) return
    navigator.clipboard.writeText(rawToken)
    notify.admin.project.tokenCopied()
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
            <span className="text-xs text-muted-foreground">Carregando...</span>
          </div>
        ) : (
          <SearchableSelect
            value={teamId}
            onValueChange={setTeamId}
            disabled={readOnly}
            placeholder="Selecione uma equipe"
            options={teams.map(team => ({
              value: team.id,
              label: team.name,
            }))}
          />
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

            {/* Summary Section - Swapped here */}
            {isEdit && !isDialog && (
              <FormSection
                title="Sobre o Projeto"
                description="Uma breve descrição que será exibida na página inicial da Wiki."
              >
                <Field>
                  <FieldLabel>Resumo do Projeto</FieldLabel>
                  <FieldContent>
                    <Textarea
                      placeholder="Descreva o propósito deste projeto, quem são os responsáveis e links úteis..."
                      className="min-h-[180px] md:min-h-[250px] resize-none"
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      disabled={readOnly}
                    />
                  </FieldContent>
                  <FieldDescription>
                    Este texto ajuda os novos membros da equipe a entenderem o contexto desse
                    projeto rapidamente.
                  </FieldDescription>
                </Field>
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
              <div className="flex-1 flex items-center justify-center min-h-80">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square w-full max-h-80"
                >
                  <RadarChart data={transformedChartData}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <PolarGrid gridType="circle" radialLines={false} />
                    <PolarAngleAxis dataKey="score" tick={{ fontSize: 10 }} />
                    <Radar
                      dataKey="count"
                      fill="var(--primary)"
                      fillOpacity={0.8}
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fillOpacity: 1,
                        fill: 'var(--primary)',
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t mt-auto">
                <Field>
                  <FieldLabel className="text-xs uppercase tracking-wider opacity-60">
                    Total Capturado
                  </FieldLabel>
                  <div className="text-xl font-bold">{data?.totalFeedbacks || 0}</div>
                </Field>

                <Field>
                  <FieldLabel className="text-xs uppercase tracking-wider opacity-60">
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

        {isEdit && !isDialog && (
          <div className="mt-8">
            <FormGrid>
              <SidebarConfigCard
                projectId={data!.id}
                initialConfig={sidebarConfig}
                onChange={setSidebarConfig}
                readOnly={readOnly}
              />

              {/* Integration Section - Swapped here */}
              <FormSection
                title="Integração (API)"
                description="Chave utilizada para invocar o Webhook Público via header x-project-token."
                className="flex-1 h-fit"
              >
                {rawToken ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Token Gerado
                    </Label>
                    <InputGroup className="w-full">
                      <InputGroupInput
                        readOnly
                        value={rawToken}
                        className="font-mono text-xs bg-muted/30"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          onClick={copyToken}
                          size="icon-sm"
                          variant="ghost"
                          title="Copiar token"
                        >
                          <CopyIcon className="h-3.5 w-3.5" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <p className="text-[10px] text-muted-foreground italic">
                      Este token não será exibido novamente após recarregar a página.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-xl bg-muted/5">
                    <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                      A chave fica oculta por segurança. Gere uma nova se necessário.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          disabled={isGenerating || !canUpdate || readOnly}
                          variant="outline"
                          size="sm"
                          className="h-9 gap-2 px-4"
                        >
                          {isGenerating ? (
                            <RotateCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCw className="h-3.5 w-3.5" />
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
            </FormGrid>
          </div>
        )}
      </FormLayout>
    </form>
  )
}
