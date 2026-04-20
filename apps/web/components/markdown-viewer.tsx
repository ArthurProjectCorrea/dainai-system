'use client'

import * as React from 'react'
import { MdPreview } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { useTheme } from 'next-themes'

const getHeadingId = ({ index }: { index: number }) => `heading-${index}`

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
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
      <MdPreview
        editorId="doc-preview"
        modelValue={content}
        theme={theme === 'dark' ? 'dark' : 'light'}
        language="en-US"
        previewTheme="github"
        codeTheme="atom"
        className="!bg-transparent !p-0"
        style={
          {
            '--md-bk-color': 'transparent',
            '--md-color': theme === 'dark' ? '#fff' : 'inherit',
          } as React.CSSProperties
        }
        mdHeadingId={getHeadingId}
      />
    </div>
  )
}
