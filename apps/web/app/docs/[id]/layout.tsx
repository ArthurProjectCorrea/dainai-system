import { getDocumentByIdAction } from "@/lib/action/document-actions"
import { PageHeader } from "@/components/page-header"
import { notFound } from "next/navigation"

export default async function DocumentLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: document, error } = await getDocumentByIdAction(id)

  if (error || !document) {
    notFound()
  }

  const breadcrumbs = [
    { label: document.projectName },
    { label: document.name }
  ]

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col p-4">
        {children}
      </div>
    </div>
  )
}
