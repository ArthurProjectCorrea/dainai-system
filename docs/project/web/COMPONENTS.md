# 🧩 Componentes Principais

## Provedor de Auth

Arquivo: `apps/web/components/providers/auth-provider.tsx`

Responsabilidades:

- carregar usuario autenticado (`/api/v1/auth/me`)
- normalizar payload para `User`
- manter `activeTeamId`
- disponibilizar `hasPermission`
- executar logout

## Sidebar

Arquivos:

- `apps/web/components/sidebar/app-sidebar.tsx`
- `apps/web/components/sidebar/sidebar.tsx`
- `apps/web/components/sidebar/team-switcher.tsx`

Responsabilidades:

- exibir seletor de time
- montar menu a partir de permissoes ativas
- ocultar itens sem permissao

## Formularios de Auth

Arquivos:

- `apps/web/components/form/login-form.tsx`
- `apps/web/components/form/forgot-password-form.tsx`
- `apps/web/components/form/verify-otp-form.tsx`
- `apps/web/components/form/reset-password-form.tsx`

Responsabilidades:

- capturar dados do usuario
- disparar server actions
- exibir feedback de erro/sucesso
