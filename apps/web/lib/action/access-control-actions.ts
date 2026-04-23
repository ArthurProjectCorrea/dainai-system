'use server'

import { getAuthHeaders } from './auth-actions'
import type {
  Department,
  Position,
  AccessControlPayload,
  SavePositionRequest,
  SaveDepartmentRequest,
} from '@/types/access-control'

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'

export async function getAccessControlDataAction(): Promise<{
  data?: AccessControlPayload
  error?: string
}> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/access-control`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar dados de controle de acesso.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getDepartmentByIdAction(
  id: string,
): Promise<{ data?: Department; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/access-control/departments/${id}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Departamento não encontrado.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function saveDepartmentAction(payload: SaveDepartmentRequest, id?: string) {
  try {
    const headers = await getAuthHeaders()
    const url = id
      ? `${API_BASE}/admin/access-control/departments/${id}`
      : `${API_BASE}/admin/access-control/departments`
    const method = id ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao salvar departamento.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function deleteDepartmentAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/access-control/departments/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Falha ao excluir departamento.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getPositionByIdAction(
  id: string,
): Promise<{ data?: Position; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/access-control/positions/${id}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Cargo não encontrado.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function savePositionAction(payload: SavePositionRequest, id?: string) {
  try {
    const headers = await getAuthHeaders()
    const url = id
      ? `${API_BASE}/admin/access-control/positions/${id}`
      : `${API_BASE}/admin/access-control/positions`
    const method = id ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao salvar cargo.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function deletePositionAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/access-control/positions/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Falha ao excluir cargo.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}
