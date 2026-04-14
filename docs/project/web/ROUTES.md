# 🗺️ Rotas Web

## Publicas

- /auth/login
- /auth/forgot-password
- /auth/verify-otp
- /auth/reset-password

## Privadas

- /dashboard
- /admin/teams
- /forbidden (fallback de permissao no grupo privado)

## Comportamento do Proxy

1. Se autenticado e acessar / ou /auth/login -> redireciona para /dashboard.
2. Se nao autenticado e acessar rota privada -> redireciona para /auth/login.
3. Se acessar /auth/reset-password sem token -> redireciona para /auth/forgot-password.
4. Se houver active_team_id em cookie, o proxy envia X-Active-Team-Id para o backend.

## API e arquivos estaticos no mesmo dominio

- chamadas para /api/\* sao reescritas para BACKEND_API_URL.
- chamadas para /uploads/\* sao reescritas para BACKEND_IMAGE_URL.
- cookies da request original sao mantidos.

## Observacao de navegacao administrativa

Itens administrativos da sidebar foram ajustados para:

- /admin/access-control
- /admin/users
- /admin/teams
