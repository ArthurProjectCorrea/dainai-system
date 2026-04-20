'use client'

import * as React from 'react'
import { MdCatalog } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { useTheme } from 'next-themes'
import { ListIcon } from 'lucide-react'

const getHeadingId = ({ index }: { index: number }) => `heading-${index}`

interface DocumentCatalogProps {
  className?: string
}

export function DocumentCatalog({ className }: DocumentCatalogProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className} />
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4 px-2">
        <ListIcon className="size-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nesta Página
        </span>
      </div>
      <div className="border-l border-border/50 pl-2">
        <MdCatalog
          editorId="doc-preview"
          theme={theme === 'dark' ? 'dark' : 'light'}
          offsetTop={100}
          scrollElementOffsetTop={80}
          className="!bg-transparent text-sm"
          mdHeadingId={getHeadingId}
          onClick={(e, heading) => {
            const id = getHeadingId(heading)
            const element = document.getElementById(id)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
        />
      </div>
    </div>
  )
}
