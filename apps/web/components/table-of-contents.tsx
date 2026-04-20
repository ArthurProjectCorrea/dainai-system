'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ListIcon } from 'lucide-react'
import { type Heading } from '@/lib/utils/toc-utils'

interface TableOfContentsProps {
  headings: Heading[]
  className?: string
  onItemClick?: () => void
  hideTitle?: boolean
}

export function TableOfContents({
  headings,
  className,
  onItemClick,
  hideTitle = false,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>('')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0% -80% 0%' },
    )

    headings.forEach(heading => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className={className}>
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-3 px-2">
          <ListIcon className="size-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Nesta Página
          </span>
        </div>
      )}

      <nav className="border-l border-border/50 space-y-1">
        {headings.map(heading => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={e => {
              e.preventDefault()
              const element = document.getElementById(heading.id)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                window.history.pushState(null, '', `#${heading.id}`)
                onItemClick?.()
              }
            }}
            className={cn(
              'block py-1.5 px-4 text-sm transition-all duration-300 border-l-[3px] -ml-[2px] hover:text-foreground',
              activeId === heading.id
                ? 'border-primary text-foreground font-bold bg-primary/5'
                : 'border-transparent text-muted-foreground font-medium hover:bg-muted/30',
              heading.level === 1 && 'pl-4',
              heading.level === 2 && 'pl-8 text-xs opacity-90',
              heading.level >= 3 && 'pl-12 text-xs opacity-80',
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
