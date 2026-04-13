# ⚙️ Servicos e Modulos de Integracao

## 1. Server Actions de Auth

Arquivo: `apps/web/app/auth/actions.ts`

Responsavel por chamadas seguras ao backend:

- login/logout
- forgot password
- verify OTP
- reset password

Caracteristicas:

- `cache: 'no-store'`
- parse defensivo de erro
- espelhamento de cookie de auth no login

## 2. AuthProvider

Arquivo: `apps/web/components/providers/auth-provider.tsx`

Responsavel por:

- hidratar usuario via `/api/v1/auth/me`
- gerenciar time ativo
- expor `hasPermission`
- disponibilizar estado global de auth

## 3. Proxy de Borda

Arquivo: `apps/web/proxy.ts`

Responsavel por:

- redirecionamentos de auth
- bloqueio de rotas privadas
- rewrite de `/api/*`
- injecao de `X-Active-Team-Id`
