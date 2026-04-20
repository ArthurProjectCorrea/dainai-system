/**
 * Gera um ID amigável (slug) a partir de um texto.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres não alfanuméricos exceto hífens
    .replace(/--+/g, '-') // Substitui múltiplos hífens por um único
    .replace(/^-+/, '') // Remove hífens do início
    .replace(/-+$/, '') // Remove hífens do final
}

export interface Heading {
  id: string
  text: string
  level: number
}

/**
 * Extrai títulos (h1-h6) de uma string Markdown.
 */
export function extractHeadings(markdown: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: Heading[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    headings.push({
      id: slugify(text),
      text,
      level,
    })
  }

  return headings
}
