import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DocsSidebar } from "@/components/sidebar/docs-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/components/providers/auth-provider"

import { DocsProvider } from '@/context/docs-context'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('AuthToken')?.value
  const identityToken = cookieStore.get('.AspNetCore.Identity.Application')?.value
  
  if (!authToken && !identityToken) {
    redirect('/auth/login')
  }

  return (
    <AuthProvider>
      <DocsProvider>
        <SidebarProvider>
          <DocsSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DocsProvider>
    </AuthProvider>
  )
}
