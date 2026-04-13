# 🗺️ Rotas Web

## Publicas

- `/auth/login`
- `/auth/forgot-password`
- `/auth/verify-otp`
- `/auth/reset-password`

## Privadas

- `/dashboard`

## Comportamento do Proxy

1. Se autenticado e acessar `/` ou `/auth/login` -> redireciona para `/dashboard`.
2. Se nao autenticado e acessar rota privada -> redireciona para `/auth/login`.
3. Se acessar `/auth/reset-password` sem `token` -> redireciona para `/auth/forgot-password`.

## API no mesmo dominio

- chamadas para `/api/*` sao reescritas para `BACKEND_API_URL`.
- cookies da request original sao mantidos.
- header `X-Active-Team-Id` e incluido quando disponivel.
