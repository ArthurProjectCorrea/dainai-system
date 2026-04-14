# ⚙️ Servicos e Modulos de Integracao

## 1. Server Actions de Auth

Arquivo: apps/web/app/auth/actions.ts

Responsavel por chamadas seguras ao backend:

- login/logout
- forgot password
- verify OTP
- reset password

Caracteristicas:

- cache: no-store
- parse defensivo de erro
- espelhamento de cookie de auth no login

## 2. AuthProvider

Arquivo: apps/web/components/providers/auth-provider.tsx

Responsavel por:

- hidratar usuario via /api/v1/auth/me
- gerenciar time ativo
- expor hasPermission
- normalizar payload legado e atual
- disponibilizar estado global de auth

## 3. Proxy de Borda

Arquivo: apps/web/proxy.ts

Responsavel por:

- redirecionamentos de auth
- bloqueio de rotas privadas
- rewrite de /api/\* para BACKEND_API_URL
- rewrite de /uploads/\* para BACKEND_IMAGE_URL
- injecao de X-Active-Team-Id

## 4. Modulo Teams (client)

Arquivos:

- app/(private)/admin/teams/page.tsx
- components/form/team-form.tsx

Responsavel por:

- operacoes CRUD de equipe
- upload de imagem usando /api/v1/storage/upload
- renderizacao de tabela com componentes reutilizaveis
