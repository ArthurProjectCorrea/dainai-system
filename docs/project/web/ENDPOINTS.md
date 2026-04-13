# 🔌 Endpoints Consumidos pelo Web

O frontend nao expoe API propria de negocio. Ele consome a API backend via `/api/*`.

## Auth

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/reset-password`

## Headers relevantes

- Cookie de autenticacao: `AuthToken` ou `.AspNetCore.Identity.Application`
- Header opcional para escopo de time: `X-Active-Team-Id`

## Observacao

Todas as chamadas saem do navegador para o proprio dominio Next (`/api/*`) e sao reescritas no `proxy.ts` para `BACKEND_API_URL`.
