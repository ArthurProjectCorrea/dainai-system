# 🔐 Autenticacao no Web

## Endpoints Consumidos

Via `apps/web/app/auth/actions.ts`:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me` (via `AuthProvider`)

## Fluxo de Login

1. Formulario envia email/senha para server action `loginAction`.
2. Action chama backend `POST /api/v1/auth/login`.
3. Cookie de autenticacao retornado pela API e espelhado no dominio Next.
4. Proxy detecta cookie e libera rotas privadas.

## Fluxo de Recuperacao de Senha

1. `/auth/forgot-password`: solicita codigo OTP por email.
2. `/auth/verify-otp`: valida codigo e recebe `resetToken`.
3. `/auth/reset-password?token=...`: define nova senha enviando `Reset-Token` para a API.

Regra de seguranca no proxy:

- acesso a `/auth/reset-password` sem query `token` redireciona para `/auth/forgot-password`.

## Logout

- `logoutAction` chama `POST /api/v1/auth/logout` quando existe cookie.
- remove cookies locais (`AuthToken`, `.AspNetCore.Identity.Application`).
- limpa sessao local (`clearSession`) e redireciona para `/auth/login`.

## Observacoes

- Nao ha uso de localStorage para token de autenticacao.
- O unico dado salvo no localStorage para sessao e `active_team_id`.
