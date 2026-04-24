import Image from 'next/image'
import * as React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import { slugify } from '@/lib/utils/toc-utils'
import { cn } from '@/lib/utils'
import { MdxCodeBlock } from '@/components/wiki/mdx-code-block'
import { MermaidRenderer } from '@/components/wiki/mermaid-renderer'

interface MdxViewerProps {
  content: string
}

type MDXHeadingProps = React.ComponentPropsWithoutRef<'h1'>
type MDXParagraphProps = React.ComponentPropsWithoutRef<'p'>
type MDXAnchorProps = React.ComponentPropsWithoutRef<'a'>
type MDXListProps = React.ComponentPropsWithoutRef<'ul'>
type MDXQuoteProps = React.ComponentPropsWithoutRef<'blockquote'>
type MDXPreProps = React.ComponentPropsWithoutRef<'pre'> & {
  'data-filename'?: string
  'data-language'?: string
}
type MDXCodeProps = React.ComponentPropsWithoutRef<'code'>
type MDXTableProps = React.ComponentPropsWithoutRef<'table'>
type MDXTableCellProps = React.ComponentPropsWithoutRef<'th'>

/**
 * Helper para extrair texto puro de nós React (children),
 * lidando com arrays, elementos aninhados, etc.
 */
function extractText(node: React.ReactNode): string {
  if (!node) return ''
  if (typeof node === 'string' || typeof node === 'number') return node.toString()
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    if (props && props.children) {
      return extractText(props.children)
    }
  }
  return ''
}

const components = {
  h1: ({ children, className, ...props }: MDXHeadingProps) => {
    const text = extractText(children)
    return (
      <h1
        id={slugify(text)}
        className={cn('font-bold text-3xl mt-10 mb-5 scroll-mt-24 text-foreground', className)}
        {...props}
      >
        {children}
      </h1>
    )
  },
  h2: ({ children, className, ...props }: MDXHeadingProps) => {
    const text = extractText(children)
    return (
      <h2
        id={slugify(text)}
        className={cn('font-bold text-2xl mt-8 mb-4 scroll-mt-24 text-foreground/90', className)}
        {...props}
      >
        {children}
      </h2>
    )
  },
  h3: ({ children, className, ...props }: MDXHeadingProps) => {
    const text = extractText(children)
    return (
      <h3
        id={slugify(text)}
        className={cn('font-bold text-xl mt-6 mb-3 scroll-mt-24 text-foreground/80', className)}
        {...props}
      >
        {children}
      </h3>
    )
  },
  h4: ({ children, className, ...props }: MDXHeadingProps) => {
    const text = extractText(children)
    return (
      <h4
        id={slugify(text)}
        className={cn('font-bold text-lg mt-5 mb-2 scroll-mt-24 text-foreground/70', className)}
        {...props}
      >
        {children}
      </h4>
    )
  },
  h5: ({ children, className, ...props }: MDXHeadingProps) => {
    const text = extractText(children)
    return (
      <h5
        id={slugify(text)}
        className={cn('font-bold text-base mt-4 mb-2 scroll-mt-24 text-foreground/60', className)}
        {...props}
      >
        {children}
      </h5>
    )
  },
  h6: ({ children, className, ...props }: MDXHeadingProps) => {
    const text = extractText(children)
    return (
      <h6
        id={slugify(text)}
        className={cn(
          'font-bold text-sm mt-4 mb-2 scroll-mt-24 text-foreground/50 italic',
          className,
        )}
        {...props}
      >
        {children}
      </h6>
    )
  },
  p: ({ children, className, ...props }: MDXParagraphProps) => (
    <p className={cn('leading-7 mb-4 text-foreground/90', className)} {...props}>
      {children}
    </p>
  ),
  strong: ({ children, className, ...props }: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className={cn('font-semibold text-foreground', className)} {...props}>
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
    <em className={cn('italic', className)} {...props}>
      {children}
    </em>
  ),
  a: ({ children, className, ...props }: MDXAnchorProps) => (
    <a
      className={cn('text-primary hover:underline underline-offset-4', className)}
      {...props}
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  ul: ({ children, className, ...props }: MDXListProps) => (
    <ul className={cn('list-disc pl-8 mb-4 space-y-1 text-foreground/90', className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }: MDXListProps) => (
    <ol className={cn('list-decimal pl-8 mb-4 space-y-1 text-foreground/90', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className={cn('pl-1', className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, className, ...props }: MDXQuoteProps) => (
    <blockquote
      className={cn(
        'border-l-4 border-muted py-1 pl-4 my-4 italic text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: ({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr className={cn('my-8 border-muted', className)} {...props} />
  ),
  pre: ({ children, className, ...props }: MDXPreProps) => {
    const language = props['data-language']

    if (language === 'mermaid') {
      const rawCode = extractText(children)
      return <MermaidRenderer code={rawCode} />
    }

    return (
      <MdxCodeBlock filename={props['data-filename']} language={language} className={className}>
        {children}
      </MdxCodeBlock>
    )
  },
  code: ({ children, className, ...props }: MDXCodeProps) => {
    const isInline = !className

    if (isInline) {
      return (
        <code
          className={cn('bg-muted/80 px-1 rounded font-mono text-[0.9em]', className)}
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <code className={cn('relative block', className)} {...props}>
        {children}
      </code>
    )
  },
  img: ({ className, alt, src }: React.ComponentPropsWithoutRef<'img'>) => (
    <span className="block my-8 text-center">
      <span
        className={cn(
          'relative block rounded-lg overflow-hidden border border-border/30 shadow-sm mx-auto max-w-full',
          className,
        )}
      >
        <Image
          src={(src as string) || ''}
          alt={alt || ''}
          width={1000}
          height={600}
          className="w-full h-auto object-cover"
        />
      </span>
      {alt && (
        <span className="block text-center text-xs text-muted-foreground mt-2 italic">{alt}</span>
      )}
    </span>
  ),
  table: ({ children, className, ...props }: MDXTableProps) => (
    <div className="overflow-x-auto my-6 border rounded">
      <table className={cn('w-full border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, className, ...props }: MDXTableCellProps) => (
    <th className={cn('bg-muted p-2 text-left font-bold border', className)} {...props}>
      {children}
    </th>
  ),
  td: ({ children, className, ...props }: MDXTableCellProps) => (
    <td className={cn('p-2 border', className)} {...props}>
      {children}
    </td>
  ),
}

export async function MdxViewer({ content }: MdxViewerProps) {
  return (
    <div className="mdx-content">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: {
                    dark: 'github-dark',
                    light: 'github-light',
                  },
                  keepBackground: false,
                },
              ],
            ],
          },
        }}
        components={components}
      />
    </div>
  )
}
