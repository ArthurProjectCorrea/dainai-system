import * as React from 'react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { getWikiDocumentByIdAction } from '@/lib/action/document-actions'
import { MdxViewer } from '@/components/mdx-viewer'
import { TableOfContents } from '@/components/table-of-contents'
import { extractHeadings } from '@/lib/utils/toc-utils'
import { MobileToc } from '@/components/mobile-toc'

export default async function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await getWikiDocumentByIdAction(id)

  if (res.error || !res.data) {
    return notFound()
  }

  const doc = res.data
  const headings = extractHeadings(doc.content)

  return (
    <div className="flex flex-col 2xl:flex-row gap-10 min-h-full pl-4 lg:pl-6 pr-2 pb-20">
      <MobileToc headings={headings} />
      {/* Main Content Column */}
      <main className="flex-1 min-w-0 max-w-5xl w-full space-y-16 pt-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Cabeçalho do Documento Compacto */}
        <header className="">
          <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
            {doc.name}
          </h1>

          <div className="mt-1 mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#A1A1A1] font-medium transition-colors">
            <span className="flex items-center gap-1.5">
              Projeto: <span className="text-foreground/80">{doc.projectName}</span>
            </span>
            <span className="text-border/40">•</span>
            <span>
              Atualizado em{' '}
              {format(new Date(doc.updatedAt || doc.createdAt), 'MMMM dd, yyyy', { locale: ptBR })}
            </span>
            {doc.currentVersion && (
              <>
                <span className="text-border/40">•</span>
                <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">
                  {doc.currentVersion}
                </span>
              </>
            )}
            {doc.categories.length > 0 && (
              <>
                <span className="text-border/40">•</span>
                <div className="flex gap-1.5">
                  {doc.categories.map(cat => (
                    <span
                      key={cat.id}
                      className="bg-muted px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 border border-border/50"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
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
