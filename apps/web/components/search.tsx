'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, FileTextIcon } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchDocumentsAction } from '@/lib/action/document-actions'
import { Document } from '@/types/document'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/use-debounce'
import { Kbd } from '@/components/ui/kbd'

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
      console.log('[SearchForm] Searching for:', debouncedQuery, 'Project:', activeProjectId)
      const { data, error } = await searchDocumentsAction(debouncedQuery, activeProjectId)
      if (error) {
        console.error('[SearchForm] Error:', error)
      }
      if (data) {
        console.log('[SearchForm] Results received:', data.length)
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

  const getExcerpt = (content: string, term: string) => {
    const cleanContent = content.replace(/[#*`]/g, '')
    const index = cleanContent.toLowerCase().indexOf(term.toLowerCase())
    if (index === -1) return cleanContent.slice(0, 100) + '...'

    const start = Math.max(0, index - 40)
    const end = Math.min(cleanContent.length, index + term.length + 60)
    let excerpt = cleanContent.slice(start, end)

    if (start > 0) excerpt = '...' + excerpt
    if (end < cleanContent.length) excerpt = excerpt + '...'

    return excerpt
  }

  return (
    <>
      <div {...props} className="relative group cursor-pointer" onClick={() => setOpen(true)}>
        <div className="flex h-8 w-full items-center gap-2 rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground transition-all hover:bg-muted/50 sm:w-[250px] lg:w-[280px]">
          <SearchIcon className="size-3.5 group-hover:text-primary transition-colors" />
          <span className="flex-1 text-left">Pesquisar documentos...</span>
          <Kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 opacity-100 sm:flex">
            <span className="text-[10px]">⌘</span>K
          </Kbd>
        </div>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="sm:max-w-2xl border-none shadow-2xl overflow-hidden bg-popover/95 backdrop-blur-md top-[15%] translate-y-0 min-h-[250px] flex flex-col max-h-[85vh]"
        showCloseButton={true}
      >
        <div className="flex flex-col flex-1">
          <div className="px-6 py-2 border-b border-border/50 bg-muted/20">
            <h2 className="text-lg font-semibold tracking-tight">Buscar Documentação</h2>
            <p className="text-xs text-muted-foreground">
              Pesquise por nome, categorias ou conteúdo dos documentos.
            </p>
          </div>

          <Command
            shouldFilter={false}
            className="flex-1 [&_[data-slot=command-input-wrapper]]:border-b [&_[data-slot=command-input-wrapper]]:border-border/50 [&_[data-slot=command-input-wrapper]]:p-3 [&_[data-slot=command-input-wrapper]_div]:h-11! [&_[data-slot=command-input-wrapper]_input]:h-11 [&_[data-slot=command-input-wrapper]_input]:text-sm [&_[data-slot=command-input-wrapper]_svg]:size-4 [&_[data-slot=command-input-wrapper]_svg]:opacity-40"
          >
            <CommandInput
              placeholder="O que você está procurando?"
              value={query}
              onValueChange={setQuery}
            />

            <CommandList className="no-scrollbar min-h-[300px] max-h-none flex-1 p-2">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-[11px] font-medium animate-pulse">Buscando...</p>
                </div>
              )}

              {!loading && results.length === 0 && query.length >= 2 && (
                <CommandEmpty className="py-12 flex flex-col items-center gap-2">
                  <p className="text-sm font-medium">Nenhum documento encontrado.</p>
                  <p className="text-xs text-muted-foreground text-center">
                    Tente outros termos ou verifique seu projeto.
                  </p>
                </CommandEmpty>
              )}

              {!loading && results.length > 0 && (
                <CommandGroup heading="Resultados da pesquisa" className="p-0">
                  {results.map(doc => (
                    <CommandItem
                      key={doc.id}
                      value={doc.id}
                      onSelect={() => {
                        router.push(`/docs/${doc.id}`)
                        setOpen(false)
                      }}
                      className="flex flex-col items-start gap-1 p-3 aria-selected:bg-accent/40 rounded-xl transition-all cursor-pointer mb-1 last:mb-0 border border-transparent aria-selected:border-border/20 group/item"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <FileTextIcon className="size-4 text-primary/80 group-aria-selected/item:text-primary transition-colors" />
                          <span>{highlightText(doc.name, query)}</span>
                        </div>
                        {doc.currentVersion && (
                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/20 font-mono text-[9px] h-4.5 px-1"
                          >
                            {doc.currentVersion}
                          </Badge>
                        )}
                      </div>

                      {doc.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {doc.categories.map(cat => (
                            <Badge
                              key={cat.id}
                              variant="secondary"
                              className="text-[9px] px-1.5 h-4 font-medium uppercase tracking-tight"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-muted-foreground/70 line-clamp-2 mt-1 leading-relaxed">
                        {highlightText(getExcerpt(doc.content, query), query)}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Kbd className="size-4 p-0 flex items-center justify-center text-[8px]">↑↓</Kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <Kbd className="h-4 px-1 flex items-center justify-center text-[8px]">Enter</Kbd>
                  Selecionar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">Spotlight Search</span>
                <Kbd className="h-4 px-1 flex items-center justify-center text-[8px]">Esc</Kbd>
              </div>
            </div>
          </Command>
        </div>
      </CommandDialog>
    </>
  )
}
