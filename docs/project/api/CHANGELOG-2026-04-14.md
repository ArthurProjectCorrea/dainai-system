# 📝 Changelog API - 2026-04-14

## Escopo

Atualizacoes recentes aplicadas na API para evoluir RBAC, equipes e armazenamento de arquivos.

## Contratos e DTOs

- TeamResponse ampliado com iconUrl.
- Novo SaveTeamRequest para criar/atualizar equipes.
- AccessDto ampliado com name.
- UserTeamDto ampliado com isActive.

## Auth e RBAC

- IAuthService recebeu HasPermissionAsync.
- HasPermissionAttribute passou a usar HasPermissionAsync.
- Cache principal de RBAC passou para rbac*v4*{userId}.
- Login, logout e reset agora limpam tambem chaves legadas (rbac, rbac_v2, rbac_v3).

## Admin Teams

- GET /admin/teams agora ignora registros soft-deletados (DeletedAt != null).
- POST /admin/teams usa SaveTeamRequest e retorna TeamResponse.
- PUT /admin/teams/{id} para atualizar nome, icone, logotipo e status.
- DELETE /admin/teams/{id} aplica soft delete.
- Exclusao bloqueada quando a equipe possui vinculos em ProfileTeams.

## Storage

- Novo IFileService e implementacao FileService.
- Novo endpoint autenticado POST /api/v1/storage/upload.
- Validacoes: extensao permitida (.jpg/.jpeg/.png/.webp) e tamanho maximo de 2MB.
- app.UseStaticFiles habilitado para servir /uploads/\*.

## Infra e deploy

- Program.cs registra IFileService no DI.
- docker-compose.yml adiciona volume persistente:
  - ./apps/api/wwwroot/uploads:/app/wwwroot/uploads

## Impacto no frontend

- Frontend pode usar team.isActive para bloquear selecao de contextos inativos.
- Frontend pode exibir nomes completos de telas via access.name.
- Upload de logos passa a ser suportado por endpoint dedicado.
