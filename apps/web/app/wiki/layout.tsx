import { headers } from 'next/headers'
import { WikiSidebar } from '@/components/sidebar/wiki-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/components/providers/auth-provider'

import { WikiProvider } from '@/context/wiki-context'
import { getWikiDocumentByIdAction } from '@/lib/action/document-action'

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  // Obter o pathname do header injetado pelo proxy
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  let initialProjectId: string | null = null

  // Se estivermos visualizando um documento, buscar seu projeto para inicializar o contexto
  if (pathname.startsWith('/wiki/')) {
    const docId = pathname.split('/')[2]
    if (docId && docId !== 'new') {
      const { data: document } = await getWikiDocumentByIdAction(docId)
      if (document) {
        initialProjectId = document.projectId
      }
    }
  }

  return (
    <AuthProvider>
      <WikiProvider initialProjectId={initialProjectId}>
        <SidebarProvider>
          <WikiSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </WikiProvider>
    </AuthProvider>
  )
}
