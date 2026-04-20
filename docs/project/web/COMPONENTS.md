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

- data-table.tsx (Componente base genericamente tipado como `<TData>`)
- data-table-toolbar.tsx
- data-table-column-header.tsx
- data-table-pagination.tsx
- data-table-dialog.tsx
- data-table-view-options.tsx
- data-table-skeleton.tsx
- data-table-faceted-filter.tsx
- data-table-quick-filter.tsx (Busca textual rapida)
- data-table-detailed-filter.tsx (Filtros avancados por coluna)

Responsabilidades:

- listagem com busca e ordenacao
- suporte a tipagem estrita via generics `<TData>`
- controle de colunas visiveis
- paginacao
- acao de recarregar
- dialogo de novo/edicao
- confirmacao para exclusao

## Hooks de Infraestrutura

### useFormMode

Local: `apps/web/hooks/use-form-mode.ts`
Detecta o estado do formulario (create, edit, view) baseado na URL.

### useAdminModule

Local: `apps/web/hooks/use-admin-module.ts`
Gerencia autorizacao automatica, nome da tela e indicadores para paginas administrativas.

## Componentes de Formulario Avancados

### CreatableCombobox

Arquivo: `apps/web/components/creatable-combobox.tsx`

Componente de selecao que permite:

- Pesquisa case-insensitive em lista de opcoes.
- Sugestao de criacao de novo termo caso nao exista na lista.
- Feedback visual de "Criar novo: 'termo'".
- Integracao direta com formulários Shadcn/Field.

## Layouts de Formulario (`FormLayout`)

Local: `apps/web/components/layouts/form-layout.tsx`

O `FormLayout` e a base para todos os CRUDs da aplicacao. Suporta dois modos:
- **Variant "page"**: Para telas cheias com cabecalho integrado.
- **Variant "dialog"**: Para formulários dentro de modais.

### Propriedades Principais:
- `mode`: (`create` | `edit` | `view`) altera labels de botoes e visibilidade de campos.
- `extraActions`: Permite injetar botoes customizados no header (ex: "Publicar").
- `onSuccess` / `onCancel`: Callbacks para navegacao pos-acao.

## Padrao de Formulario Administrativo

Todos os formulários seguem o padrao:

1. **Estrutura**: `FormLayout` > `FormGrid` > `FormSection` > `Field`.
2. **Camadas**:
   - `FormGrid`: Controla a responsividade das colunas.
   - `FormSection`: Agrupa campos logicamente com titulo e descricao.
   - `Field`: Componente atomico que gerencia Label + Input + Erros.
3. **Persistencia**: Uso obrigatorio de Server Actions em `apps/web/lib/*-actions.ts`.

### Exemplos Implementados:
- `user-form.tsx`: Gestao de usuarios e atribuições.
- `project-form.tsx`: Gestao de projetos e integracoes.
- `document-form.tsx`: Edicao de Markdown com layouts complexos.
- `access-control-form.tsx`: Matriz de permissoes.

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
