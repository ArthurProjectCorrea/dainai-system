# 📝 Changelog Web - 2026-04-14

## Escopo

Atualizacoes realizadas no modulo Web para alinhar UX administrativa, RBAC por time e integracao com upload de arquivos.

## Rotas e navegacao

- Criada rota privada de administracao de equipes: /admin/teams.
- Criada pagina de fallback de permissao: /(private)/forbidden.
- Sidebar administrativa ajustada para usar prefixo /admin em vez de /dashboard.
- Layout privado ajustado para ocupar altura completa com main flex.

## RBAC e contexto de usuario

- AuthProvider passou a normalizar campos adicionais vindos da API:
  - access.name
  - team.iconUrl
  - team.isActive
- TeamSwitcher agora desabilita selecao de equipes inativas.

## CRUD de equipes

- Nova tela de listagem com DataTable reutilizavel.
- Novo formulario TeamForm para criar/editar equipe.
- Exclusao de equipe via DELETE /api/v1/admin/teams/{id}.
- Indicadores da tela implementados com StatCard.

## Upload de arquivos

- TeamForm integrado com POST /api/v1/storage/upload.
- Proxy atualizado para reescrever /uploads/\* para BACKEND_IMAGE_URL.

## Componentes reutilizaveis adicionados

- StatCard
- DataTable e subcomponentes:
  - data-table
  - data-table-toolbar
  - data-table-column-header
  - data-table-pagination
  - data-table-dialog
  - data-table-view-options
  - data-table-skeleton
  - data-table-faceted-filter

## Formularios de auth

- Formularios de login/forgot/verify/reset receberam Spinner para feedback de envio.

## Tipagem

- Novo arquivo types/team.ts para Team e TeamAccess.
- types/auth.ts passou a reutilizar Team e TeamAccess.

## Configuracao

- next.config.ts: ativado experimental.authInterrupts.
- Proxy e deploy documentados com BACKEND_IMAGE_URL.
