import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DocsSidebar } from '@/components/sidebar/docs-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/components/providers/auth-provider'

import { DocsProvider } from '@/context/docs-context'
import { getWikiDocumentByIdAction } from '@/lib/action/document-actions'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('AuthToken')?.value
  const identityToken = cookieStore.get('.AspNetCore.Identity.Application')?.value

  if (!authToken && !identityToken) {
    redirect('/auth/login')
  }

  // Obter o pathname do header injetado pelo proxy
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  let initialProjectId: string | null = null

  // Se estivermos visualizando um documento, buscar seu projeto para inicializar o contexto
  if (pathname.startsWith('/docs/')) {
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
      <DocsProvider initialProjectId={initialProjectId}>
        <SidebarProvider>
          <DocsSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </DocsProvider>
    </AuthProvider>
  )
}
