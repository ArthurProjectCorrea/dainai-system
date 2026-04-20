'use server'

import { getAuthHeaders } from './auth-actions'
import type {
  Project,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/project'

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'

export async function getProjectsAction(): Promise<{ data?: ProjectListResponse; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/projects`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar projetos.' }

    const data = await response.json()
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getProjectByIdAction(
  id: string,
): Promise<{ data?: Project; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/projects/${id}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Projeto não encontrado.' }

    const data = await response.json()
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function createProjectAction(payload: CreateProjectRequest) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Falha ao criar projeto.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function updateProjectAction(id: string, payload: UpdateProjectRequest) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Falha ao atualizar projeto.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Falha ao excluir projeto.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function rotateProjectTokenAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/projects/${id}/rotate-token`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    })

    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Falha ao rotacionar token.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}
