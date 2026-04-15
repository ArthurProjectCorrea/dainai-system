# 🧩 Componentes Principais

## Provedor de Auth

Arquivo: apps/web/components/providers/auth-provider.tsx

Responsabilidades:

- carregar usuario autenticado (/api/v1/auth/me)
- normalizar payload para User (incluindo campos name, iconUrl e isActive)
- manter activeTeamId
- disponibilizar hasPermission
- executar logout

## Sidebar

Arquivos:

- apps/web/components/sidebar/app-sidebar.tsx
- apps/web/components/sidebar/sidebar.tsx
- apps/web/components/sidebar/team-switcher.tsx

Responsabilidades:

- exibir seletor de time
- montar menu a partir de permissoes ativas
- ocultar itens sem permissao
- bloquear selecao de times inativos

## Tabela administrativa reutilizavel

Diretorio: apps/web/components/ui/data-table/

Componentes:

- data-table.tsx
- data-table-toolbar.tsx
- data-table-column-header.tsx
- data-table-pagination.tsx
- data-table-dialog.tsx
- data-table-view-options.tsx
- data-table-skeleton.tsx
- data-table-faceted-filter.tsx

Responsabilidades:

- listagem com busca e ordenacao
- controle de colunas visiveis
- paginacao
- acao de recarregar
- dialogo de novo/edicao
- confirmacao para exclusao

## Componentes de Formulario Avancados

### CreatableCombobox

Arquivo: `apps/web/components/creatable-combobox.tsx`

Componente de selecao que permite:

- Pesquisa case-insensitive em lista de opcoes.
- Sugestao de criacao de novo termo caso nao exista na lista.
- Feedback visual de "Criar novo: 'termo'".
- Integracao direta com formulários Shadcn/Field.

### Padrao de Formulario Administrativo

Todos os novos formulários (ex: `access-control-form.tsx`) seguem o padrao:

- **Grid de Info Basica**: 2 colunas (`grid-cols-1 md:grid-cols-2`) para Nome e Vinculo Principal.
- **Largura Total**: Ocupa todo o container disponível.
- **Matrix de Permissoes**: Tabela responsiva com cores neutras e hover states.

Arquivos:

- app/(private)/admin/teams/page.tsx
- components/form/team-form.tsx
- types/team.ts

Responsabilidades:

- listar equipes
- criar/editar/excluir equipe
- upload de logotipo
- alternar status ativo/inativo
- exibir indicadores com StatCard

## Formularios de Auth

Arquivos:

- components/form/login-form.tsx
- components/form/forgot-password-form.tsx
- components/form/verify-otp-form.tsx
- components/form/reset-password-form.tsx

Responsabilidades:

- capturar dados do usuario
- disparar server actions
- exibir feedback de erro/sucesso
- indicar estado pendente com Spinner

## Fallback de permissao

Arquivo: app/(private)/forbidden.tsx

Responsabilidades:

- comunicar bloqueio de acesso
- permitir recarregar pagina
- permitir retorno ao dashboard
