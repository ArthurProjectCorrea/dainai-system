'use server'

import { cookies } from 'next/headers'

export async function getApiBase() {
  return process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'
}

export async function getAuthHeaders() {
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

/**
 * Wrapper de fetch para Server Actions com tratamento de erro global
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const headers = await getAuthHeaders()
    const apiBase = await getApiBase()
    const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Em Server Actions, podemos retornar um erro específico ou realizar o redirecionamento
      // Aqui optamos por retornar o erro para que o componente possa limpar o estado local se necessário
      return { error: 'SESSION_EXPIRED', status: 401 }
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        error: data.message || 'Ocorreu um erro na requisição.',
        status: response.status,
      }
    }

    return { data: data.data as T, status: response.status }
  } catch (err) {
    console.error(`[apiFetch] Error on ${endpoint}:`, err)
    return { error: 'Erro de conexão com o servidor.' }
  }
}
