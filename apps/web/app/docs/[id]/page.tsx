import * as React from 'react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Tag, Hash } from 'lucide-react'

import { getDocumentByIdAction } from '@/lib/action/document-actions'
import { Badge } from '@/components/ui/badge'
import { MdxViewer } from '@/components/mdx-viewer'
import { TableOfContents } from '@/components/table-of-contents'
import { extractHeadings } from '@/lib/utils/toc-utils'

export default async function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await getDocumentByIdAction(id)

  if (res.error || !res.data) {
    return notFound()
  }

  const doc = res.data
  const headings = extractHeadings(doc.content)

  return (
    <div className="flex flex-col lg:flex-row gap-10 min-h-full px-4 lg:px-10 pb-20">
      {/* Main Content Column */}
      <main className="flex-1 max-w-4xl mx-auto w-full space-y-16 py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Cabeçalho do Documento */}
        <header className="space-y-6 pb-10 border-b border-border/50">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight lg:text-5xl text-foreground">
              {doc.name}
            </h1>
            <p className="text-lg text-muted-foreground font-medium italic opacity-70">
              Projeto: {doc.projectName}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(doc.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
            </div>

            {doc.currentVersion && (
              <div className="flex items-center gap-2 text-primary">
                <Hash className="h-4 w-4" />
                <span>v{doc.currentVersion}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-primary" />
              <div className="flex gap-2">
                {doc.categories.map(cat => (
                  <Badge key={cat.id} variant="outline" className="px-3 py-1 h-6 text-[10px] font-black border-primary/20 bg-primary/5 text-primary rounded-full">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Markdown Renderizado com MDX Nativo */}
        <div className="min-h-[600px]">
          <MdxViewer content={doc.content} />
        </div>

        {/* Footer do Documento */}
        <footer className="pt-20 border-t border-border/50 text-muted-foreground text-[10px] uppercase tracking-widest font-bold italic opacity-40 text-center">
          Documento gerenciado pelo sistema DAINAI. Revisado em {doc.updatedAt ? format(new Date(doc.updatedAt), "dd/MM/yyyy HH:mm") : format(new Date(doc.createdAt), "dd/MM/yyyy HH:mm")}.
        </footer>
      </main>

      {/* Sidebar: Table of Contents */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-border/30 pl-6 py-10 sticky top-[80px] h-fit">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  )
}
