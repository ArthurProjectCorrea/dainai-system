'use server'

import { clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1'

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
    return { error: 'E-mail e senha sao obrigatorios.' }
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'E-mail ou senha invalidos.' }
      }

      const data = await response.json().catch(() => ({}))
      return { error: data.message || 'Erro ao realizar login.' }
    }

    // Mirror backend auth cookie to Next domain
    const authCookie = extractAuthCookie(response)
    if (!authCookie) {
      return { error: 'Nao foi possivel iniciar a sessao. Tente novamente.' }
    }

    const cookieStore = await cookies()
    cookieStore.set(authCookie.name, authCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return { success: true }
  } catch {
    return { error: 'Erro de conexao com o servidor.' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('AuthToken')?.value
  const identityToken = cookieStore.get('.AspNetCore.Identity.Application')?.value
  const authCookieHeader = authToken
    ? `AuthToken=${authToken}`
    : identityToken
      ? `.AspNetCore.Identity.Application=${identityToken}`
      : null

  if (authCookieHeader) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: authCookieHeader },
      cache: 'no-store',
    }).catch(() => null)
  }

  cookieStore.delete('AuthToken')
  cookieStore.delete('.AspNetCore.Identity.Application')
  await clearSession()
  redirect('/auth/login')
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { error: data.message || 'Erro ao enviar codigo.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro de conexao com o servidor.' }
  }
}

export async function verifyOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('otp') as string

  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { error: data.message || 'Codigo invalido.' }
    }

    const passwordToken = data?.data?.resetToken ?? ''
    return { success: true, passwordToken }
  } catch {
    return { error: 'Erro de conexao com o servidor.' }
  }
}

export async function resetPasswordAction(passwordToken: string, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (password !== confirmPassword) {
    return { error: 'As senhas nao conferem.' }
  }

  if (!passwordToken) {
    return { error: 'Token de redefinicao ausente.' }
  }

  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `Reset-Token=${passwordToken}`,
      },
      body: JSON.stringify({
        newPassword: password,
        confirmPassword,
      }),
      cache: 'no-store',
    })

    if (res.status === 401) {
      return { error: 'Codigo expirado. Solicite um novo.' }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return { error: errorData.message || 'Erro ao redefinir senha.' }
    }

    return { success: true, message: 'Senha alterada com sucesso.' }
  } catch {
    return { error: 'Erro de conexao com o servidor.' }
  }
}
