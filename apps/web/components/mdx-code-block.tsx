'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface MdxCodeBlockProps {
  children: React.ReactNode
  filename?: string
  language?: string
  className?: string
}

export function MdxCodeBlock({
  children,
  filename,
  language = 'code',
  className,
}: MdxCodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  const onCopy = () => {
    if (preRef.current) {
      const codeElement = preRef.current.querySelector('code')
      const text = codeElement?.innerText || preRef.current.innerText
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="group relative my-8 overflow-hidden rounded-xl border border-border/80 bg-[#0d1117] shadow-xl dark:bg-black/40">
      {/* Header Estilo Editor */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#161b22] px-4 py-2.5 dark:bg-zinc-900/80">
        <div className="flex items-center gap-4">
          {/* Mac Dots */}
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-[#ff5f56]" />
            <div className="size-3 rounded-full bg-[#ffbd2e]" />
            <div className="size-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Filename & Info */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {language}
            </span>
            {filename && (
              <>
                <span className="text-white/10">•</span>
                <span className="text-[11px] font-medium text-zinc-400 font-mono italic">
                  {filename}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {copied ? (
              <span className="text-emerald-400">Copiado!</span>
            ) : (
              <>
                <span>Copy</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <pre
        ref={preRef}
        className={cn(
          'p-5 overflow-x-auto font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
          className,
        )}
      >
        {children}
      </pre>
    </div>
  )
}
