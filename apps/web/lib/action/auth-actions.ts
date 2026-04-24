'use server'

import { clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { apiFetch, getApiBase } from '@/lib/api-client'

function extractCookieValue(setCookieHeader: string, cookieName: string): string | null {
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = setCookieHeader.match(new RegExp(`${escapedName}=([^;]+)`))
  return match?.[1] ?? null
}

function getSetCookieHeaders(response: Response): string[] {
  const headersWithSetCookie = response.headers as Headers & { getSetCookie?: () => string[] }
  if (typeof headersWithSetCookie.getSetCookie === 'function') {
    return headersWithSetCookie.getSetCookie()
  }

  const single = response.headers.get('set-cookie')
  if (!single) return []
  return [single]
}

function extractAuthCookie(response: Response): { name: string; value: string } | null {
  const candidates = ['AuthToken', '.AspNetCore.Identity.Application']
  const setCookieHeaders = getSetCookieHeaders(response)

  for (const headerValue of setCookieHeaders) {
    for (const name of candidates) {
      const value = extractCookieValue(headerValue, name)
      if (value) {
        return { name, value }
      }
    }
  }

  return null
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-mail e senha sao obrigatorios.', success: false }
  }

  try {
    const apiBase = await getApiBase()
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'E-mail ou senha inválidos.', success: false }
      }

      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Erro ao realizar login.', success: false }
    }

    // Mirror backend auth cookie to Next domain
    const authCookie = extractAuthCookie(response)
    if (!authCookie) {
      return { error: 'Nao foi possivel iniciar a sessao. Tente novamente.', success: false }
    }

    // Limpeza preventiva antes de salvar nova sessão
    await clearSession()

    const cookieStore = await cookies()
    cookieStore.set(authCookie.name, authCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return { success: true, error: undefined }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Erro de conexão com o servidor.', success: false }
  }
}

export async function logoutAction() {
  await apiFetch('/auth/logout', {
    method: 'POST',
  }).catch(() => null)

  await clearSession()
  redirect('/auth/login')
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  const res = await apiFetch<void>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  if (res.error) return { error: res.error, success: false }
  return { success: true, error: undefined }
}

export async function verifyOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('otp') as string

  const res = await apiFetch<{ resetToken: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })

  if (res.error) return { error: res.error, success: false }
  return { success: true, passwordToken: res.data?.resetToken, error: undefined }
}

export async function resetPasswordAction(passwordToken: string, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (password !== confirmPassword) {
    return { error: 'As senhas nao conferem.', success: false }
  }

  if (!passwordToken) {
    return { error: 'Token de redefinicao ausente.', success: false }
  }

  const res = await apiFetch<void>('/auth/reset-password', {
    method: 'POST',
    headers: {
      Cookie: `Reset-Token=${passwordToken}`,
    },
    body: JSON.stringify({
      newPassword: password,
      confirmPassword,
    }),
  })

  if (res.error) {
    if (res.status === 401) return { error: 'Codigo expirado. Solicite um novo.', success: false }
    return { error: res.error, success: false }
  }

  return { success: true, message: 'Senha alterada com sucesso.', error: undefined }
}
