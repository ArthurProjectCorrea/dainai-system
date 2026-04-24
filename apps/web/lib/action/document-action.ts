'use server'

import { apiFetch } from '@/lib/api-client'
import type {
  Document,
  DocumentListResponse,
  Category,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  PublishedDocument,
} from '@/types'
import type { Project } from '@/types'

export async function getDocumentsAction() {
  return apiFetch<DocumentListResponse>('/admin/documents')
}

export async function getDocumentByIdAction(id: string) {
  return apiFetch<Document>(`/admin/documents/${id}`)
}

export async function getWikiDocumentByIdAction(id: string) {
  return apiFetch<Document>(`/wiki/${id}`)
}

export async function getWikiDocumentVersionsAction(id: string) {
  return apiFetch<PublishedDocument[]>(`/wiki/${id}/versions`)
}

export async function getWikiDocumentVersionByIdAction(versionId: string) {
  return apiFetch<Document>(`/wiki/versions/${versionId}`)
}

export async function createDocumentAction(request: CreateDocumentRequest) {
  return apiFetch<Document>('/admin/documents', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function updateDocumentAction(id: string, request: UpdateDocumentRequest) {
  return apiFetch<Document>(`/admin/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export async function deleteDocumentAction(id: string) {
  return apiFetch<void>(`/admin/documents/${id}`, {
    method: 'DELETE',
  })
}

export async function publishDocumentAction(id: string) {
  return apiFetch<Document>(`/admin/documents/${id}/publish`, {
    method: 'POST',
  })
}

export async function getDocumentVersionsAction(id: string) {
  return apiFetch<PublishedDocument[]>(`/admin/documents/${id}/versions`)
}

export async function getDocumentVersionByIdAction(versionId: string) {
  return apiFetch<Document>(`/admin/documents/versions/${versionId}`)
}

export async function getCategoriesAction() {
  return apiFetch<Category[]>('/admin/documents/categories')
}

export async function createCategoryAction(name: string) {
  return apiFetch<Category>('/admin/documents/categories', {
    method: 'POST',
    body: JSON.stringify(name),
  })
}

export async function getWikiNavigationAction() {
  return apiFetch<{
    projects: Project[]
    documents: Document[]
  }>('/wiki/navigation')
}

export async function searchDocumentsAction(query: string, projectId?: string | null) {
  let url = `/wiki/search?q=${encodeURIComponent(query)}`
  if (projectId) url += `&projectId=${projectId}`

  return apiFetch<Document[]>(url)
}
