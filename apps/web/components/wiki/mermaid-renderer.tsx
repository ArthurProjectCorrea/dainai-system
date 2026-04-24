'use client'

import * as React from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface MermaidRendererProps {
  code: string
  className?: string
}

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const { resolvedTheme } = useTheme()
  const [svg, setSvg] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const id = React.useId().replace(/:/g, '') // Mermaid IDs cannot contain colons

  React.useEffect(() => {
    // Inicializar mermaid apenas no cliente
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    })

    const renderDiagram = async () => {
      setLoading(true)
      setError(null)
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, code)
        setSvg(svg)
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError('Falha ao renderizar o diagrama. Verifique a sintaxe.')
      } finally {
        setLoading(false)
      }
    }

    renderDiagram()
  }, [code, resolvedTheme, id])

  return (
    <div
      className={cn(
        'group relative my-8 flex flex-col items-center justify-center rounded-xl border border-border/50 bg-muted/30 p-8 shadow-sm transition-all hover:border-border/80 hover:bg-muted/50',
        className,
      )}
    >
      {/* Indicador de Tipo */}
      <div className="absolute top-3 left-4 flex items-center gap-2 opacity-30 transition-opacity group-hover:opacity-100">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-primary/40" />
          <div className="size-2.5 rounded-full bg-primary/20" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Diagrama Fluxo
        </span>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-medium text-muted-foreground animate-pulse">
            Gerando fluxo...
          </span>
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <pre className="mt-2 max-w-full overflow-x-auto rounded bg-black/5 p-2 text-[10px] text-muted-foreground font-mono">
            {code}
          </pre>
        </div>
      ) : (
        !loading && (
          <div
            className="w-full max-w-full overflow-x-auto overflow-y-hidden py-4 text-center scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      )}
    </div>
  )
}
