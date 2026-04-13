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
  const pathSegments = pathname.split('/').filter(Boolean)
  const isPublicPath =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'

  if (!isPublicPath && pathSegments.length > 0) {
    // Se não estiver logado, manda para o login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // 3. Proxy de API para o Backend C#
  if (pathname.startsWith('/api')) {
    const backendUrl = new URL(
      pathname,
      process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1',
    )
    const requestHeaders = new Headers(request.headers)
    const activeTeamId = request.cookies.get('active_team_id')?.value
    if (activeTeamId) {
      requestHeaders.set('X-Active-Team-Id', activeTeamId)
    }

    return NextResponse.rewrite(backendUrl, {
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
