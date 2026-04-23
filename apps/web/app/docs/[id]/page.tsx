import * as React from 'react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import {
  getWikiDocumentByIdAction,
  getWikiDocumentVersionsAction,
  getWikiDocumentVersionByIdAction,
} from '@/lib/action/document-actions'
import { MdxViewer } from '@/components/mdx-viewer'
import { TableOfContents } from '@/components/table-of-contents'
import { extractHeadings } from '@/lib/utils/toc-utils'
import { MobileToc } from '@/components/mobile-toc'
import { VersionSelector } from '@/components/version-selector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export default async function DocumentViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v?: string }>
}) {
  const { id } = await params
  const { v: versionId } = await searchParams

  const [res, versionsRes] = await Promise.all([
    versionId ? getWikiDocumentVersionByIdAction(versionId) : getWikiDocumentByIdAction(id),
    getWikiDocumentVersionsAction(id),
  ])

  if (res.error || !res.data) {
    return notFound()
  }

  const doc = res.data
  const versions = versionsRes.data || []
  const isLatest = !versionId
  const headings = extractHeadings(doc.content)

  return (
    <div className="flex flex-col 2xl:flex-row gap-10 min-h-full pl-4 lg:pl-6 pr-2 pb-20">
      <MobileToc headings={headings} />
      {/* Main Content Column */}
      <main className="flex-1 min-w-0 max-w-5xl w-full space-y-16 pt-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Cabeçalho do Documento Compacto */}
        <header className="">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground">
                {doc.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs font-medium text-muted-foreground/60">
                <span className="font-bold">{doc.projectName}</span>
                <span>•</span>
                <span>
                  {format(new Date(doc.updatedAt || doc.createdAt), "dd 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })}
                </span>
                {doc.categories?.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex gap-1.5">
                      {doc.categories.map(cat => (
                        <span key={cat.id} className="uppercase tracking-wider text-[10px]">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <VersionSelector versions={versions} currentVersionId={versionId || ''} />
          </div>

          {!isLatest && (
            <Alert className="mt-8 bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-3 py-3 px-4">
              <InfoIcon className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs font-medium text-current p-0">
                Você está visualizando uma <strong>versão anterior</strong> deste documento ({' '}
                {doc.currentVersion} ).
              </AlertDescription>
            </Alert>
          )}
        </header>

        {/* Conteúdo Markdown Renderizado com MDX Nativo */}
        <div className="min-h-[37.5rem]">
          <MdxViewer content={doc.content} />
        </div>

        {/* Footer do Documento */}
        <footer className="pt-20 border-t border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-bold italic opacity-40 text-center">
          Documento gerenciado pelo sistema DAINAI. Revisado em{' '}
          {doc.updatedAt
            ? format(new Date(doc.updatedAt), 'dd/MM/yyyy HH:mm')
            : format(new Date(doc.createdAt), 'dd/MM/yyyy HH:mm')}
          .
        </footer>
      </main>

      {/* Sidebar: Table of Contents */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-16 max-h-[calc(100vh-100px)] overflow-y-auto pt-5 pr-2 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent animate-in fade-in duration-1000">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  )
}
