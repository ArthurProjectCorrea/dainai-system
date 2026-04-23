'use server'

import { getAuthHeaders } from './auth-actions'
import type { Team } from '@/types/team'

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'

export async function getTeamsAction(): Promise<{ data?: Team[]; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/teams`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) return { error: 'Falha ao carregar equipes.' }

    const data = await response.json().catch(() => ({}))
    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function createTeamAction(payload: Partial<Team>) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao criar equipe.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function updateTeamAction(id: string, payload: Partial<Team>) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/teams/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.message || 'Falha ao atualizar equipe.' }

    return { data: data.data }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}

export async function deleteTeamAction(id: string) {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE}/admin/teams/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Falha ao excluir equipe.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }
}
