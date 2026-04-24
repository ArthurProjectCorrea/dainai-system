import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('AuthToken')
  const identityToken = request.cookies.get('.AspNetCore.Identity.Application')
  const isAuthenticated = Boolean(authToken || identityToken)

  // 1. Redirecionamento de usuários já autenticados saindo da tela de login ou home
  if ((pathname.startsWith('/auth/login') || pathname === '/') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 1.1 Redirecionamento se acessar reset-password sem o token
  if (pathname === '/auth/reset-password') {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.redirect(new URL('/auth/forgot-password', request.url))
    }
  }

  // 2. Proteção de Rotas Privadas
  const isPublicPath =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/' ||
    pathname === '/favicon.ico'

  if (!isPublicPath) {
    // Se não estiver logado, manda para o login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // 3. Proxy de API para o Backend C#
  if (pathname.startsWith('/api') || pathname.startsWith('/uploads')) {
    // Configuração do URL do backend baseada no tipo de recurso (API ou Uploads)
    const baseBackendUrl = process.env.BACKEND_IMAGE_URL || 'http://localhost:5000'
    const finalUrl = pathname.startsWith('/uploads')
      ? new URL(pathname, baseBackendUrl)
      : new URL(pathname, process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1')

    const requestHeaders = new Headers(request.headers)
    const activeTeamId = request.cookies.get('active_team_id')?.value
    if (activeTeamId) {
      requestHeaders.set('X-Active-Team-Id', activeTeamId)
    }

    return NextResponse.rewrite(finalUrl, {
      request: {
        headers: requestHeaders,
      },
    })
  }

  // 4. Passar pathname para a aplicação via header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
