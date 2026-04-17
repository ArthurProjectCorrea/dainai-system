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

Itens administrativos da sidebar foram padronizados para o uso de rotas catch-all (`[...action]`):

- `/admin/access-control` (Listagem)
- `/admin/access-control/[...action]` (Gerenciamento)
- `/admin/users` (Listagem)
- `/admin/users/[...action]` (Gerenciamento)
- `/admin/teams` (Listagem)

### Padrao de Acoes Administrativas

As rotas `[...action]` derivam o comportamento do formulario a partir da URL:

1. **Create**: `/admin/{modulo}/create` -> Inicia formulario vazio.
2. **Edit**: `/admin/{modulo}/{id}/edit` -> Busca dados por ID para edicao.
3. **View**: `/admin/{modulo}/{id}/view` -> Busca dados por ID para visualizacao (Read-Only).

Este padrao e sustentado pelo hook `useFormMode` e permite a centralizacao de permissoes e logica de fetch em um unico arquivo de pagina.
