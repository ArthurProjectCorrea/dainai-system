import { getWikiDocumentByIdAction } from '@/lib/action/document-action'
import { PageHeader } from '@/components/layouts/page-header'

export default async function DocumentLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: document } = await getWikiDocumentByIdAction(id)

  const breadcrumbs = document
    ? [{ label: document.projectName }, { label: document.name }]
    : [{ label: 'Documento' }]

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
