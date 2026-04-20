'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, FileTextIcon, AlignLeftIcon, HashIcon } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchDocumentsAction } from '@/lib/action/document-actions'
import { Document } from '@/types/document'
import { useDebounce } from '@/hooks/use-debounce'
import { Kbd } from '@/components/ui/kbd'
import { slugify } from '@/lib/utils/toc-utils'

import { useDocs } from '@/context/docs-context'
import { Command } from '@/components/ui/command'

export function SearchForm({ ...props }: React.ComponentProps<'div'>) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<Document[]>([])
  const [loading, setLoading] = React.useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const { activeProjectId } = useDocs()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  React.useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      const { data, error } = await searchDocumentsAction(debouncedQuery, activeProjectId)
      if (error) {
        console.error('[SearchForm] Error:', error)
      }
      if (data) {
        setResults(data)
      }
      setLoading(false)
    }

    performSearch()
  }, [debouncedQuery, activeProjectId])

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="text-primary font-bold underline decoration-primary/40 decoration-[1.5px] underline-offset-[3px]"
        >
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const getExcerpt = (content: string, term: string, matchIndex: number = -1) => {
    const cleanContent = content.replace(/[#*`]/g, ' ')

    let index = matchIndex
    if (index === -1) {
      index = cleanContent.toLowerCase().indexOf(term.toLowerCase())
    }

    if (index === -1) return cleanContent.slice(0, 100).trim() + '...'

    const start = Math.max(0, index - 40)
    const end = Math.min(cleanContent.length, index + term.length + 120) // Faixa maior para aproveitar largura
    let excerpt = cleanContent.slice(start, end).trim()

    if (start > 0) excerpt = '...' + excerpt
    if (end < cleanContent.length) excerpt = excerpt + '...'

    return excerpt
  }

  const getMatches = (doc: Document, term: string) => {
    const matches: {
      id: string
      section?: string
      anchor?: string
      excerpt: string
      isTitle?: boolean
    }[] = []
    const lowerTerm = term.toLowerCase()

    if (doc.name.toLowerCase().includes(lowerTerm)) {
      matches.push({
        id: `title-${doc.id}`,
        isTitle: true,
        excerpt: doc.name,
      })
    }

    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: { pos: number; text: string; slug: string }[] = []
    let hMatch
    while ((hMatch = headingRegex.exec(doc.content)) !== null) {
      headings.push({
        pos: hMatch.index,
        text: hMatch[2].trim(),
        slug: slugify(hMatch[2].trim()),
      })
    }

    const termRegex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    let tMatch
    let count = 0
    const seenSections = new Set<string>()

    while ((tMatch = termRegex.exec(doc.content)) !== null && count < 5) {
      const pos = tMatch.index
      const nearestHeading = [...headings].reverse().find(h => h.pos <= pos)
      const sectionKey = nearestHeading?.slug || 'intro'

      if (seenSections.has(sectionKey)) continue
      seenSections.add(sectionKey)

      matches.push({
        id: `match-${doc.id}-${count}`,
        section: nearestHeading?.text,
        anchor: nearestHeading?.slug,
        excerpt: getExcerpt(doc.content, term, pos),
      })
      count++
    }

    return matches
  }

  return (
    <>
      <div {...props} className="relative group cursor-pointer" onClick={() => setOpen(true)}>
        <div className="flex h-8 w-full items-center gap-2 rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground transition-all hover:bg-muted/50 sm:w-64 lg:w-72">
          <SearchIcon className="size-3.5 group-hover:text-primary transition-colors" />
          <span className="flex-1 text-left">Pesquisar documentos...</span>
          <Kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </Kbd>
        </div>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="sm:max-w-3xl border-none shadow-2xl overflow-hidden bg-popover/95 backdrop-blur-md top-[10%] translate-y-0 flex flex-col max-h-[80vh]"
        showCloseButton={true}
      >
        <div className="flex flex-col flex-1">
          <div className="px-6 pt-4 pb-2 border-b border-border/50 bg-muted/10">
            <h2 className="text-base font-bold tracking-tight">Pesquisa Global</h2>
            <p className="text-[11px] text-muted-foreground/60">
              Navegue pelos documentos e seções do projeto ativo.
            </p>
          </div>

          <Command
            shouldFilter={false}
            className="flex-1 [&_[data-slot=command-input-wrapper]]:border-b [&_[data-slot=command-input-wrapper]]:border-border/50 [&_[data-slot=command-input-wrapper]]:p-2 [&_[data-slot=command-input-wrapper]_div]:h-10! [&_[data-slot=command-input-wrapper]_input]:h-10 [&_[data-slot=command-input-wrapper]_input]:text-sm"
          >
            <CommandInput
              placeholder="Digite o que deseja encontrar..."
              value={query}
              onValueChange={setQuery}
            />

            <CommandList className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                  <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium animate-pulse">Buscando...</p>
                </div>
              )}

              {!loading && results.length === 0 && query.length >= 2 && (
                <CommandEmpty className="py-20 flex flex-col items-center gap-2">
                  <p className="text-sm font-medium opacity-40">
                    Nenhum resultado para &quot;{query}&quot;
                  </p>
                </CommandEmpty>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-4">
                  {results.map(doc => {
                    const matches = getMatches(doc, query)
                    if (matches.length === 0) return null

                    return (
                      <div key={doc.id} className="group/doc">
                        {/* Header do Documento - Estilo Barra */}
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/40 rounded-lg border border-border/40 mb-1">
                          <FileTextIcon className="size-4 text-muted-foreground/70" />
                          <span className="text-xs font-bold text-foreground/90 flex-1 truncate">
                            {doc.name}
                          </span>
                          <div className="flex gap-1">
                            {doc.categories.map(cat => (
                              <span
                                key={cat.id}
                                className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/40 bg-background/50 px-1 rounded-sm border border-border/20"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Lista de Matches - Estilo Árvore Compacta */}
                        <div className="ml-5 border-l border-border/40 pl-2 space-y-0.5">
                          {matches.map(match => (
                            <CommandItem
                              key={match.id}
                              value={match.id + match.excerpt}
                              onSelect={() => {
                                const url = `/docs/${doc.id}${match.anchor ? `#${match.anchor}` : ''}`
                                router.push(url)
                                setOpen(false)
                              }}
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-all border border-transparent aria-selected:border-border/10 aria-selected:bg-accent/40"
                            >
                              <div className="mt-0.5">
                                {match.isTitle ? (
                                  <AlignLeftIcon className="size-3.5 text-primary/60" />
                                ) : (
                                  <HashIcon className="size-3.5 text-muted-foreground/40" />
                                )}
                              </div>

                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-foreground/80 leading-tight">
                                  {match.isTitle ? 'Introdução' : match.section || 'Conteúdo'}
                                </div>
                                <div className="text-[11px] text-muted-foreground/50 line-clamp-2 mt-0.5 leading-relaxed tracking-tight">
                                  {highlightText(match.excerpt, query)}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CommandList>

            <div className="flex items-center justify-between border-t border-border/30 bg-muted/5 px-4 py-2 text-[10px] text-muted-foreground/40 font-medium">
              <div className="flex items-center gap-4 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Kbd className="size-4 p-0 flex items-center justify-center text-[10px] bg-muted/20 border-border/20 outline-none!">
                    ↑↓
                  </Kbd>
                  <span>Navegar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd className="h-4 px-1 flex items-center justify-center text-[10px] bg-muted/20 border-border/20 outline-none!">
                    Enter
                  </Kbd>
                  <span>Abrir</span>
                </div>
              </div>
            </div>
          </Command>
        </div>
      </CommandDialog>
    </>
  )
}
