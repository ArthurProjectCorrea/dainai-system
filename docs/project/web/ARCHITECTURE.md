# 🧱 Arquitetura Web

## Visao Geral

A aplicacao usa Next.js App Router com separacao clara entre:

- rotas publicas (`/auth/*`)
- rotas privadas (`/dashboard`)
- proxy de API (`/api/*` -> backend C#)

## Camadas

1. Roteamento e layouts

- `app/layout.tsx`: shell global
- `app/auth/layout.tsx`: layout de autenticacao
- `app/(private)/layout.tsx`: layout autenticado com sidebar

2. Sessao e identidade

- `components/providers/auth-provider.tsx`
- carrega `/api/v1/auth/me`
- seleciona e persiste `active_team_id`

3. Seguranca de borda

- `proxy.ts`
- bloqueia rotas privadas sem cookie (`AuthToken` ou `.AspNetCore.Identity.Application`)
- redireciona usuario autenticado fora do login
- injeta `X-Active-Team-Id` em chamadas `/api/*`

4. UI e navegacao

- `components/sidebar/*`
- itens de menu filtrados por permissao

## Fluxo de Requisicao

```mermaid
graph TD
  A[Navegador] --> B[Next Proxy]
  B -->|Rota de pagina| C[App Router]
  B -->|/api/*| D[Backend API C#]
  C --> E[AuthProvider]
  E -->|GET /api/v1/auth/me| B
  D --> F[Cookie de sessao + RBAC por time]
```

## Módulos Administrativos Padronizados

Para garantir consistência e facilitar a replicação de telas de CRUD (como Usuários, Times, etc.), a aplicação utiliza um padrão arquitetural baseado em:

### 1. Hook `useAdminPage`
Centraliza a lógica de:
- Busca de dados vinculada ao `activeTeamId`.
- Gerenciamento de estados de carregamento e erro.
- Cálculo de permissões granulares (`view`, `create`, `update`, `delete`) baseado no `screenKey`.

### 2. Layouts Padronizados (`AdminPageLayout`)
Conjunto de componentes estruturais:
- `AdminPage`: Container principal com espaçamento padrão.
- `AdminPageHeader`: Integração com `PageHeader` e Breadcrumbs.
- `AdminPageIndicators`: Grid para `StatCard` com métricas.
- `AdminPageTableContainer`: Container flexível para `DataTable`.

## Decisões Importantes

- Sessão em cookie HTTP-only para reduzir exposição de token no cliente.
- Seleção de time ativa no frontend e enviada por header para API.
- Filtro de menu realizado no cliente com base em `teamAccesses`.
- **Soft Delete**: Entidades administrativas são marcadas como removidas no banco sem exclusão física.
- **Visualização de Status**: Times inativos são marcados visualmente no switcher e bloqueados para seleção.

