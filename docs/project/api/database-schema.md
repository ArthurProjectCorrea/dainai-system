# Database Schema - Auth + Admin

## Objetivo

Definir o modelo relacional minimo para suportar autenticacao (ASP.NET Core Identity), RBAC e administracao de usuarios/equipes/telas.

## Convencoes

- Chaves primarias: `uuid` para entidades de negocio e `int` para catalogos estaveis quando aplicavel.
- Datas: `timestamp with time zone` (`created_at`, `updated_at`).
- Exclusao logica: usar `is_active` quando houver necessidade de historico.
- Auditoria: toda alteracao administrativa deve ser registrada em tabela de auditoria.

## Tabelas Core

### Identity (ASP.NET Core Identity)

- `AspNetUsers`
- `AspNetUserClaims`
- `AspNetUserTokens`
- `AspNetUserRoles` (se roles nativas forem usadas)

Observacoes:

- Senhas sempre em hash PBKDF2 do Identity.
- Bloqueio/lockout configurado para tentativas repetidas.

### profiles

Campos sugeridos:

- `id` (uuid, pk)
- `user_id` (uuid, fk -> AspNetUsers.Id, unique)
- `name` (varchar(160), not null)
- `avatar_url` (varchar(512), null)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

Indice/constraints:

- `uk_profiles_user_id`

### teams

Campos sugeridos:

- `id` (uuid, pk)
- `name` (varchar(120), not null)
- `logotipo_url` (varchar(512), null)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

Indice/constraints:

- `uk_teams_name` (opcional, conforme regra de negocio)

### departments

Campos sugeridos:

- `id` (int, pk)
- `name` (varchar(120), not null)
- `created_at`, `updated_at`

Indice/constraints:

- `uk_departments_name`

### positions

Campos sugeridos:

- `id` (int, pk)
- `department_id` (int, fk -> departments.id, not null)
- `name` (varchar(120), not null)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`

Indice/constraints:

- `uk_positions_department_name` (`department_id`, `name`)

### screens

Campos sugeridos:

- `id` (int, pk)
- `name` (varchar(120), not null)
- `name_sidebar` (varchar(120), not null)
- `name_key` (varchar(80), not null, unique, imutavel)
- `created_at`, `updated_at`

Regra:

- `name_key` nao pode ser alterado por API de administracao.

### permissions

Campos sugeridos:

- `id` (int, pk)
- `name` (varchar(80), not null)
- `name_key` (varchar(40), not null, unique)

Regra:

- Catalogo somente leitura operacional (mudancas apenas por migration/seed).

### accesses

Campos sugeridos:

- `id` (bigint, pk)
- `position_id` (int, fk -> positions.id, on delete cascade)
- `screen_id` (int, fk -> screens.id)
- `permission_id` (int, fk -> permissions.id)
- `created_at`, `updated_at`

Indice/constraints:

- `uk_accesses_position_screen_permission` (`position_id`, `screen_id`, `permission_id`)
- indices em `position_id`, `screen_id`, `permission_id`

### profile_team

Campos sugeridos:

- `id` (bigint, pk)
- `profile_id` (uuid, fk -> profiles.id)
- `team_id` (uuid, fk -> teams.id)
- `position_id` (int, fk -> positions.id)
- `created_at`, `updated_at`

Indice/constraints:

- `uk_profile_team_profile_team_position` (`profile_id`, `team_id`, `position_id`)

### otp_attempts

Campos sugeridos:

- `id` (bigint, pk)
- `user_id` (uuid, fk -> AspNetUsers.Id)
- `purpose` (varchar(40), not null)
- `attempt_count` (int, not null)
- `window_started_at` (timestamp with time zone, not null)
- `blocked_until` (timestamp with time zone, null)
- `created_at`, `updated_at`

Finalidade:

- Controle de brute force para OTP e fluxos sensiveis.

### audit_logs

Campos sugeridos:

- `id` (bigint, pk)
- `actor_user_id` (uuid, nullable)
- `action` (varchar(120), not null)
- `entity` (varchar(120), not null)
- `entity_id` (varchar(120), not null)
- `before_data` (jsonb, null)
- `after_data` (jsonb, null)
- `correlation_id` (uuid, not null)
- `ip` (varchar(64), null)
- `user_agent` (varchar(512), null)
- `created_at`

## Relacionamentos Criticos

- `positions` 1:N `accesses` (cascade delete)
- `profiles` 1:N `profile_team`
- `teams` 1:N `profile_team`
- `positions` 1:N `profile_team`
- `screens` e `permissions` 1:N `accesses`

## Regras de Integridade e Seguranca

- Proibir `POST` e `DELETE` em `screens` na API administrativa.
- Proibir escrita em `permissions` fora de pipeline de migration/seed.
- Revogar sessoes quando `profiles.is_active = false`.
- Invalidar cache RBAC em mudancas de `accesses`, `positions`, `profile_team` e status do usuario.
- Padronizar erros com `code`, `message` e `correlationId`.
