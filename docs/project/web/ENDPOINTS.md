# 🔌 Endpoints Consumidos pelo Web

O frontend consome a API backend via /api/\* no mesmo dominio (proxy rewrite).

## Auth

- POST /api/v1/auth/login
- GET /api/v1/auth/me
- POST /api/v1/auth/logout
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/verify-otp
- POST /api/v1/auth/reset-password

## Admin - Equipes

- GET /api/v1/admin/teams
- POST /api/v1/admin/teams
- PUT /api/v1/admin/teams/{id}
- DELETE /api/v1/admin/teams/{id}

## Storage

- POST /api/v1/storage/upload
- GET /uploads/{fileName} (via proxy para BACKEND_IMAGE_URL)

## Headers e cookies relevantes

- Cookie de autenticacao: AuthToken ou .AspNetCore.Identity.Application.
- Header opcional por escopo de time: X-Active-Team-Id.
- Cookie de escopo: active_team_id.

## Observacao

Todas as chamadas saem do navegador para o dominio do Next e sao reescritas no proxy.
