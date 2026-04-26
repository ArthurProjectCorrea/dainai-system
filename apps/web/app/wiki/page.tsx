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
  BookOpenIcon,
} from 'lucide-react'

import { PageHeader } from '@/components/layouts/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getWikiNavigationAction } from '@/lib/action/document-action'
import { useWiki } from '@/context/wiki-context'
import type { Project } from '@/types'
import type { Document } from '@/types'

interface NavigationData {
  projects: Project[]
  documents: Document[]
  latestUpdates?: Document[]
}

export default function Page() {
  const { activeProjectId, setActiveProjectId } = useWiki()
  const [data, setData] = React.useState<NavigationData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const result = await getWikiNavigationAction()
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

      <div className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
        {/* 1. Welcome Card */}
        <Card className="shadow-sm border-muted/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">
              Bem-vindo à Wiki
            </CardTitle>
            <CardDescription className="text-sm md:text-base mt-2">
              Sua central de conhecimento para{' '}
              <span className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4">
                {activeProject?.name || 'seu projeto'}
              </span>
              . Encontre guias, referências técnicas e os avanços da equipe.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 2. Project Description Card */}
        <Card className="shadow-sm border-muted/40 h-fit">
          <CardHeader className="pb-4 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <InfoIcon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base">Sobre o Projeto</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/90 whitespace-pre-wrap leading-relaxed opacity-90 pl-3 border-l-2 border-primary/20">
              {activeProject?.summary || (
                <span className="italic text-muted-foreground/50 text-xs">
                  Nenhuma descrição detalhada foi fornecida para este projeto.
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3. Content Map (Groups) Card */}
            <Card className="shadow-sm border-muted/40">
              <CardHeader className="pb-4 flex flex-row items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpenIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">Mapa de Conteúdo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeProject?.sidebarConfig || []).length > 0 ? (
                    activeProject?.sidebarConfig.map(group => (
                      <div
                        key={group.id}
                        className="p-4 rounded-xl border bg-muted/20 border-muted/40 hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <FileTextIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h3 className="text-sm font-bold truncate">{group.title}</h3>
                        </div>
                        <div className="space-y-1.5">
                          {group.items.slice(0, 4).map(item => (
                            <Link
                              key={item.id}
                              href={`/wiki/${item.documentId}`}
                              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group/item"
                            >
                              <div className="h-1 w-1 rounded-full bg-muted-foreground/30 group-hover/item:bg-primary transition-colors" />
                              <span className="truncate">{item.documentName}</span>
                            </Link>
                          ))}
                          {group.items.length > 4 && (
                            <p className="text-[10px] text-muted-foreground/50 pt-1 italic">
                              + {group.items.length - 4} documentos...
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-6 text-center border-2 border-dashed rounded-xl bg-muted/5">
                      <p className="text-sm text-muted-foreground">Nenhum menu configurado.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* 4. Latest Updates Card */}
            <Card className="shadow-sm border-muted/40">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <HistoryIcon className="h-4 w-4 text-orange-500" />
                  </div>
                  <CardTitle className="text-base">Atualizações</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase opacity-70">
                  {activeProject?.name}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {latestUpdates.length > 0 ? (
                  latestUpdates.slice(0, 5).map(doc => (
                    <Link key={doc.id} href={`/wiki/${doc.id}`} className="group block">
                      <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all border-border shadow-sm group-hover:border-primary/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold text-xs truncate group-hover:text-primary transition-colors">
                              {doc.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 uppercase font-bold tracking-tighter">
                              <CalendarIcon className="h-3 w-3 text-primary/50" />
                              {formatDistanceToNow(new Date(doc.updatedAt || doc.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </div>
                          </div>
                          <ChevronRightIcon className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center border-dashed border-2 rounded-xl bg-accent/5 flex flex-col items-center gap-3">
                    <FileTextIcon className="h-6 w-6 text-muted-foreground/30" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground">Sem atualizações</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        Nenhum documento publicado.
                      </p>
                    </div>
                  </div>
                )}
                {latestUpdates.length > 0 && (
                  <Link
                    href="#"
                    className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all opacity-70 hover:opacity-100"
                  >
                    Ver histórico completo <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
