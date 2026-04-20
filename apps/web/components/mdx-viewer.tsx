import Image from 'next/image'
import * as React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { slugify } from '@/lib/utils/toc-utils'
import { cn } from '@/lib/utils'

interface MdxViewerProps {
  content: string
}

type MDXHeadingProps = React.ComponentPropsWithoutRef<'h1'>
type MDXParagraphProps = React.ComponentPropsWithoutRef<'p'>
type MDXAnchorProps = React.ComponentPropsWithoutRef<'a'>
type MDXListProps = React.ComponentPropsWithoutRef<'ul'>
type MDXQuoteProps = React.ComponentPropsWithoutRef<'blockquote'>
type MDXPreProps = React.ComponentPropsWithoutRef<'pre'>
type MDXCodeProps = React.ComponentPropsWithoutRef<'code'>
type MDXTableProps = React.ComponentPropsWithoutRef<'table'>
type MDXTableCellProps = React.ComponentPropsWithoutRef<'th'>

const components = {
  h1: ({ children, className, ...props }: MDXHeadingProps) => (
    <h1
      id={slugify(children?.toString() || '')}
      className={cn(
        'font-bold text-3xl lg:text-4xl tracking-tight mt-12 mb-6 scroll-mt-20',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }: MDXHeadingProps) => (
    <h2
      id={slugify(children?.toString() || '')}
      className={cn(
        'font-bold text-2xl lg:text-3xl tracking-tight mt-10 mb-5 scroll-mt-20 border-b pb-2',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: MDXHeadingProps) => (
    <h3
      id={slugify(children?.toString() || '')}
      className={cn(
        'font-bold text-xl lg:text-2xl tracking-tight mt-8 mb-4 scroll-mt-20',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, className, ...props }: MDXParagraphProps) => (
    <p className={cn('leading-relaxed mb-6 text-muted-foreground/90', className)} {...props}>
      {children}
    </p>
  ),
  a: ({ children, className, ...props }: MDXAnchorProps) => (
    <a className={cn('text-primary font-bold hover:underline', className)} {...props}>
      {children}
    </a>
  ),
  ul: ({ children, className, ...props }: MDXListProps) => (
    <ul className={cn('list-disc list-inside mb-6 space-y-2', className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }: MDXListProps) => (
    <ol className={cn('list-decimal list-inside mb-6 space-y-2', className)} {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, className, ...props }: MDXQuoteProps) => (
    <blockquote
      className={cn(
        'border-l-4 border-primary/50 pl-6 my-8 italic text-lg text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  pre: ({ children, className, ...props }: MDXPreProps) => (
    <pre
      className={cn('p-6 rounded-2xl bg-muted/50 border mb-8 overflow-x-auto', className)}
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }: MDXCodeProps) => (
    <code
      className={cn('bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm border', className)}
      {...props}
    >
      {children}
    </code>
  ),
  img: ({ className, alt, src }: React.ComponentPropsWithoutRef<'img'>) => (
    <div className={cn('relative rounded-2xl shadow-2xl my-12 mx-auto overflow-hidden', className)}>
      <Image
        src={(src as string) || ''}
        alt={alt || 'Document image'}
        width={800}
        height={450}
        className="w-full h-auto object-cover"
      />
    </div>
  ),
  table: ({ children, className, ...props }: MDXTableProps) => (
    <div className="overflow-x-auto mb-8 border rounded-xl">
      <table className={cn('w-full border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, className, ...props }: MDXTableCellProps) => (
    <th className={cn('bg-muted/50 p-4 text-left font-bold border-b', className)} {...props}>
      {children}
    </th>
  ),
  td: ({ children, className, ...props }: MDXTableCellProps) => (
    <td className={cn('p-4 border-b', className)} {...props}>
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
          },
        }}
        components={components}
      />
    </div>
  )
}
