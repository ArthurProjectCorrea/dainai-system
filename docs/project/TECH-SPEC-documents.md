# Technical Specification: Documents Module

Este documento detalha a implementação do novo módulo de Documentos, permitindo a criação, edição, categorização e publicação de documentos em formato Markdown (.md).

## 1. Modelagem de Dados (Banco de Dados)

### Entidade `Category`
Representa as categorias dos documentos.
- `Id` (Int, PK)
- `Name` (String, obrigatório)
- `CreatedAt`

### Entidade `Document`
Entidade principal para edição e rascunhos.
- `Id` (Guid, PK)
- `ProjectId` (Guid, FK) - Vinculado a um projeto.
- `Name` (String, obrigatório)
- `Content` (Text) - Conteúdo Markdown bruto.
- `Status` (Enum) - `Draft` (rascunho), `Completed` (concluído), `Published` (publicado).
- `CreatedById` (Guid, FK Profile)
- `UpdatedById` (Guid, FK Profile)
- `CreatedAt`, `UpdatedAt`, `DeletedAt` (Soft Delete)

### Entidade `DocumentCategory`
Relacionamento muitos-para-muitos.
- `Id` (Int, PK)
- `DocumentId` (Guid, FK)
- `CategoryId` (Int, FK)
- `CreatedAt`

### Entidade `PublishedDocument`
Snapshots imutáveis de versões publicadas. Cada publicação gera um NOVO registro, mantendo o histórico completo.
- `Id` (Guid, PK)
- `DocumentId` (Guid, FK) - Referência ao documento original.
- `Version` (String) - Ex: "v1", "v2", "v3"... (calculado sequencialmente).
- `Content` (Text) - Conteúdo congelado no momento da publicação.
- `PublishedById` (Guid, FK Profile)
- `CreatedAt`

## 2. API (Backend .NET)

### Endpoints (`GET/POST/PUT/DELETE /api/v1/admin/documents`)
- `GET /`: Listagem com filtros de Projeto, Status e busca por nome. Deve respeitar o **Scope** do usuário (all/team/user).
- `GET /{id}`: Detalhes do documento, incluindo categorias vinculadas.
- `POST /`: Criação inicial (sempre nasce como `Draft`).
- `PUT /{id}`: Atualização de conteúdo/metadados. Se o status for alterado para `Completed`, habilita a ação de publicação para usuários com permissão. Se um documento já publicado for editado, seu status volta para `Draft`.
- `POST /{id}/publish`: Aciona a criação de um NOVO registro em `PublishedDocument`, incrementando a versão atual.
- `GET /{id}/versions`: Retorna a lista de todas as versões publicadas de um documento (apenas metadados).
- `GET /{id}/versions/{versionId}`: Retorna o snapshot completo de uma versão específica.

### Controle de Acesso e Escopos
- **Nova Tela**: `documents_management`.
- **Nova Permissão**: `approve` (Id: 5).
- **Escopos (Scope)**:
  - `all`: Ver documentos de todos os times do projeto.
  - `team`: Ver apenas documentos vinculados a times que o usuário faz parte.
  - `user`: Temporariamente segue a mesma regra de `team`.

## 3. Segurança e Controle de Acesso (Web)

A proteção da visualização de documentos é feita em múltiplas camadas:

### Camada 1: Middleware/Proxy (`apps/web/proxy.ts`)
- A rota `/docs` não é incluída no `isPublicPath`, garantindo redirecionamento automático para o login caso o usuário não esteja autenticado.

### Camada 2: Proteção Universal (`apps/web/app/docs/layout.tsx`)
- O layout atua como um Server Component que valida o **Scope** antes de renderizar o conteúdo.
- Se o usuário possuir `team scope`, o layout verifica no backend (ou via cache de perfil) se o documento/projeto pertence aos times do usuário.
- Caso a validação falhe (usuário sem acesso ao projeto ou sem permissão de `view`), o layout renderiza o componente `forbidden.tsx`.

### Camada 3: UI Feedback (`apps/web/app/docs/forbidden.tsx`)
- Componente de feedback amigável para acessos negados, mantendo a consistência visual do sistema.

### Camada 4: Hooks de Permissão (`useAuth` / `useAdminModule`)
- Utilizados no formulário e na listagem para condicionalizar ações (ex: o botão de "Publicar" só aparece para quem tem permissão de `approve`).

## 4. Web (Frontend Next.js)

### Tecnologias Sugeridas
- **Editor**: `md-editor-rt` (Suporta toolbar, preview simultâneo e temas).
- **Renderização**: `@next/mdx` (com `next-mdx-remote` para conteúdo dinâmico) + `remark-gfm` (para tabelas e checklists).
- **Estilização**: Tailwind CSS + `typography` plugin para renderização de HTML rico (`prose`).

### Telas
- **Listagem**: DataTable padrão em `apps/web/app/(private)/documents/page.tsx` com filtros e badges de status.
- **Formulário (Create/Edit)**:
  - **Componente**: `apps/web/components/form/document-form.tsx`.
  - **Página**: `apps/web/app/(private)/documents/[...action]/page.tsx`.
  - **Layout**: Duas colunas (Esquerda: Metadados como Nome, Projeto, Categorias | Direita: Editor Markdown Full Height).
  - **Categorias**: Uso do `CreatableCombobox` para seleção/criação on-the-fly.
  - **Visualização Rápida**: botão no editor para abrir o preview em uma nova aba do navegador (target="_blank"), permitindo visualizar o documento formatado sem perder o contexto da edição.
- **Visualização (View)**: Página limpa em `apps/web/app/docs/[id]/page.tsx` renderizando o Markdown para HTML, com informações de versão e data de publicação.

## 4. Plano de Execução

### Fase 1: Backend & Database
- [ ] Criar Migrations para as novas tabelas.
- [ ] Atualizar `DbInitializer` com a nova Screen e Permissão.
- [ ] Desenvolver `DocumentService` e `DocumentController`.
- [ ] Implementar lógica de versionamento e snapshots de publicação.
- [ ] **Ciclo de Estabilidade**:
    - [ ] Validar Build local (`dotnet build`).
    - [ ] Deploy para o ambiente Docker.
    - [ ] Implementar e executar testes automatizados em `apps/api-tests`.
    - [ ] Corrigir e repetir até 100% de aprovação antes de iniciar o Frontend.

### Fase 2: Frontend Base
- [ ] Definir tipos TypeScript em `apps/web/types/document.ts`.
- [ ] Implementar a `DataTable` de listagem em `apps/web/app/(private)/documents/page.tsx`.
- [ ] Implementar o `DocumentForm` em `apps/web/components/form/document-form.tsx`.

### Fase 3: Fluxo de Publicação & View
- [ ] Implementar o roteador de ações em `apps/web/app/(private)/documents/[...action]/page.tsx`.
- [ ] Criar a página de visualização limpa em `apps/web/app/docs/[id]/page.tsx`.
- [ ] Implementar a lógica de Preview em tempo real para a nova aba.

## 5. Perguntas em Aberto
- As categorias devem ser globais ou vinculadas apenas ao projeto atual?
