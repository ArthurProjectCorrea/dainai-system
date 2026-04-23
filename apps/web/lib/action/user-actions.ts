'use server'

import { getAuthHeaders } from './auth-actions'
import type {
  UserManagementOptions,
  SaveUserPayload,
  UserDetailPayload,
  UsersListPayload,
} from '@/types/user'

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'

export async function getUsersAction(): Promise<{ data?: UsersListPayload; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar usuários.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getUserByIdAction(
  id: string,
): Promise<{ data?: UserDetailPayload; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Usuário não encontrado.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function createUserAction(payload: SaveUserPayload) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao criar usuário.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function updateUserAction(id: string, payload: SaveUserPayload) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao atualizar usuário.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function deleteUserAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Falha ao excluir usuário.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function getUserOptionsAction(): Promise<{
  data?: UserManagementOptions
  error?: string
}> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/users/options`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar opções de usuário.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}
