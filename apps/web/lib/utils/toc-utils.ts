/**
 * Gera um ID amigável (slug) a partir de um texto, removendo acentos e formatação.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza para decompor acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
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
 * Remove formatação básica de Markdown do texto para gerar um slug limpo.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold **
    .replace(/__(.*?)__/g, '$1') // Bold __
    .replace(/\*(.*?)\*/g, '$1') // Italic *
    .replace(/_(.*?)_/g, '$1') // Italic _
    .replace(/`(.*?)`/g, '$1') // Code `
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links [text](url)
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
    const rawText = match[2].trim()
    const cleanText = stripMarkdown(rawText)

    headings.push({
      id: slugify(cleanText),
      text: cleanText,
      level,
    })
  }

  return headings
}
