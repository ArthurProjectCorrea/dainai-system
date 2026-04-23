'use server'

import { cookies } from 'next/headers'
import {
  Document,
  DocumentListResponse,
  Category,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  PublishedDocument,
} from '@/types/document'

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('AuthToken')?.value
  const identityToken = cookieStore.get('.AspNetCore.Identity.Application')?.value
  const activeTeamId = cookieStore.get('active_team_id')?.value

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers['Cookie'] = `AuthToken=${authToken}`
  } else if (identityToken) {
    headers['Cookie'] = `.AspNetCore.Identity.Application=${identityToken}`
  }

  if (activeTeamId) {
    headers['X-Active-Team-Id'] = activeTeamId
  }

  return headers
}

export async function getDocumentsAction() {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar documentos.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as DocumentListResponse }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getDocumentByIdAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/${id}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Documento não encontrado.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getWikiDocumentByIdAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/docs/${id}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Documento não encontrado.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getWikiDocumentVersionsAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/docs/${id}/versions`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar versões.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as PublishedDocument[] }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getWikiDocumentVersionByIdAction(versionId: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/docs/versions/${versionId}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Versão não encontrada.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function createDocumentAction(request: CreateDocumentRequest) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao criar documento.' }

    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function updateDocumentAction(id: string, request: UpdateDocumentRequest) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(request),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao atualizar documento.' }

    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Falha ao excluir documento.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function publishDocumentAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/${id}/publish`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao publicar documento.' }

    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getDocumentVersionsAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/${id}/versions`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar versões.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as PublishedDocument[] }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getDocumentVersionByIdAction(versionId: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/versions/${versionId}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Versão não encontrada.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as Document }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getCategoriesAction() {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/categories`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar categorias.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as Category[] }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function createCategoryAction(name: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/documents/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(name), // Backend expects string in body
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao criar categoria.' }

    return { data: data.data as Category }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getDocsNavigationAction() {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/docs/navigation`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar navegação.' }

    const data = await response.json().catch(() => ({}))
    return {
      data: data.data as {
        projects: import('@/types/project').Project[]
        documents: import('@/types/document').Document[]
      },
    }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function searchDocumentsAction(query: string, projectId?: string | null) {
  try {
    const headers = await getAuthHeaders()
    let url = `${API_BASE}/docs/search?q=${encodeURIComponent(query)}`

    if (projectId) {
      url += `&projectId=${projectId}`
    }

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[SearchAction] Response not OK:', response.status)
      return { error: 'Falha ao realizar busca.' }
    }

    const data = await response.json().catch(() => ({}))
    return { data: data.data as Document[] }
  } catch (err) {
    console.error('[SearchAction] Error:', err)
    return { error: 'Erro de conexão com o servidor.' }
  }
}
