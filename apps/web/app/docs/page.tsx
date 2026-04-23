'use client'

import * as React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  FileTextIcon,
  HistoryIcon,
  InfoIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  CalendarIcon,
  UserIcon,
} from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDocsNavigationAction } from '@/lib/action/document-actions'
import { useDocs } from '@/context/docs-context'
import type { Project } from '@/types/project'
import type { Document } from '@/types/document'

interface NavigationData {
  projects: Project[]
  documents: Document[]
  latestUpdates?: Document[]
}

export default function Page() {
  const { activeProjectId, setActiveProjectId } = useDocs()
  const [data, setData] = React.useState<NavigationData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const result = await getDocsNavigationAction()
        if (result.data) {
          const navData = result.data as NavigationData
          setData(navData)

          // Auto-selecionar o primeiro projeto se nenhum estiver ativo
          if (!activeProjectId && navData.projects?.length > 0) {
            setActiveProjectId(navData.projects[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch navigation:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeProjectId, setActiveProjectId])

  if (loading && !data) return null

  // Determinar o projeto ativo com base no contexto
  const activeProject = data?.projects?.find(p => p.id === activeProjectId) || data?.projects?.[0]

  // Filtrar atualizações apenas para o projeto ativo
  const latestUpdates = (data?.latestUpdates || []).filter(
    doc => doc.projectId === activeProject?.id,
  )

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumbs={[{ label: 'Introdução' }]} />

      <div className="flex-1 flex flex-col gap-8 p-6 lg:p-10 w-full pb-20">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight tracking-tighter">Bem-vindo</h1>
          <p className="text-muted-foreground max-w-3xl text-base leading-relaxed">
            Sua central de conhecimento compartilhado para{' '}
            <span className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4">
              {activeProject?.name || 'seu projeto'}
            </span>
            . Encontre guias, referências técnicas e os últimos avanços da equipe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Project Summary */}
          <div className="lg:col-span-8">
            <Card className="flex flex-col shadow-sm border-muted/40 h-full min-h-[400px]">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <InfoIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg">Sobre o Projeto: {activeProject?.name}</CardTitle>
                    <CardDescription>Propósito e diretrizes principais</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/90 whitespace-pre-wrap leading-relaxed text-base italic opacity-80 pl-2 border-l-2 border-primary/20 bg-accent/5 p-4 rounded-r-lg">
                  {activeProject?.summary || (
                    <p className="italic text-muted-foreground/50 text-sm">
                      Nenhuma descrição detalhada foi fornecida para este projeto ainda. Adicione um
                      resumo nas configurações do projeto para ajudar a equipe a se situar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Latest Updates */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20">
                  <HistoryIcon className="h-4 w-4 text-orange-500" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Últimas Atualizações
                </h2>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-black tracking-tighter opacity-70"
              >
                {activeProject?.name}
              </Badge>
            </div>

            <div className="space-y-3">
              {latestUpdates.length > 0 ? (
                latestUpdates.map(doc => (
                  <Link key={doc.id} href={`/docs/${doc.id}`} className="group block">
                    <div className="relative p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-300 border-border shadow-sm group-hover:shadow-md group-hover:ring-1 ring-primary/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                          <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-4 text-[10px] text-muted-foreground/70 uppercase font-bold tracking-tighter">
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="h-3 w-3 text-primary/50" />
                              {formatDistanceToNow(new Date(doc.updatedAt || doc.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            <span className="flex items-center gap-1.5 invisible group-hover:visible transition-all">
                              <UserIcon className="h-3 w-3" />
                              Atualizado
                            </span>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 duration-300" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center border-dashed border-2 rounded-2xl bg-accent/5 flex flex-col items-center gap-4 border-muted/50">
                  <div className="p-3 rounded-full bg-muted/20">
                    <FileTextIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-muted-foreground">Sem atualizações</p>
                    <p className="text-[10px] text-muted-foreground/60">
                      Este projeto ainda não possui documentos publicados.
                    </p>
                  </div>
                </div>
              )}

              {latestUpdates.length > 0 && (
                <Link
                  href="#"
                  className="flex items-center justify-center gap-2 p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all hover:gap-3 opacity-60 hover:opacity-100"
                >
                  Ver histórico completo <ArrowRightIcon className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
