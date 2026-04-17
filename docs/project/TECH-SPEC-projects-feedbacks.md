# Technical Specification: Module Projects & Feedbacks

Esta documentação técnica responde à proposta arquitetural de centralização de Produtos/Projetos e integração pública de Feedbacks (notas de aceitação), expandinda com uma forte melhoria no Controle de Acesso (Scoping).

## 1. Arquitetura de Dados (Database Schema)

A modelagem requer duas entidades fortemente conectadas, projetadas para isolamento e segurança.

### Entidade `Project`

Representa um produto (ou escopo) gerenciado internamente pela empresa (dainai-system).

- `Id` (Guid, PK)
- `Name` (String, obrigatório)
- `TeamId` (Guid, FK) - Vincula o projeto ao time responsável automaticamente na criação.
- `IntegrationToken` (String, UK) - Um hash criptográfico único gerado pelo sistema.
- `IsActive` (Boolean)
- `CreatedAt`, `UpdatedAt`, `DeletedAt` (Auditoria e Soft Delete)

### Entidade `ProjectFeedback`

Captura métricas geradas pelos sistemas remotos integrados (public API).

- `Id` (Guid, PK)
- `ProjectId` (Guid, FK) - Projeto alvo.
- `RefUserId` (String, indexado) - ID ou hash identificador do usuário _no sistema externo_.
- `Note` (Int) - O nível de aceitabilidade/nota fornecida.
- `CreatedAt`, `UpdatedAt`
- **Constraint (UK):** `(ProjectId, RefUserId)` - Chave única composta que impede duplicidade por usuário externo.

## 2. Solução Técnica para Integração

- **Autenticação de Máquina / Rotação de Chaves:** A requisição do "outro sistema" enviará um cabeçalho HTTP: `x-project-token: {IntegrationToken}`. Por razões de segurança, este Token só é exibido por extenso na interface **no momento exato em que ele é gerado**. O botão "Gerar Novo Token" irá invalidar permanentemente a chave anterior e salvar uma nova chave gerada de forma segura na tabela.
- **Upsert Automático (Anti-Duplicidade):** Quando a rota de public API receber o Payload (`{ "refUserId": "9812", "note": 5 }`), o C# fará um Upsert. Se existir, **atualiza (Update)** a nota. Se não existir, **cria (Insert)**. Com isso, só mantemos a avaliação mais recente.

## 3. Disposição na Interface do Usuário (UX/UI)

Centralize tudo nos Detalhes do Projeto em abas (`/admin/projects/[id]`):

- **Tab "Visão Geral" (Overview):** Edição de Nome do projeto, visualização e eventual transferência do Time vinculado.
- **Tab "Integração" (Settings):** Onde o token é gerenciado. Revela o token apenas após clicar em "Gerar Novo Token" (inativando o antigo em background) + instruções de chamada da API para o dev.
- **Tab "Feedbacks" (Dashboard):** Um Chart mostrando a "Nota Média de Aceitabilidade" do projeto e uma DataTable com o histórico avaliativo.

## 4. Melhoria no Controle de Acesso: Data Visibility Scoping (Novidade)

Para amadurecer a forma como as permissões são interpretadas dentro dos módulos administrativos e lidar de forma granular com o "Ciclo de Transferência de Time" ou "Visão Global", adotaremos um **Data Scope (Escopo de Visualização)**.

### Os Três Níveis de Escopos

1.  `all`: O usuário pode visualizar e manipular os registros de **qualquer time**, sem limite fronteiriço, mantendo seu `user_id` e sessão intocado (Público de Administradores Globais).
2.  `team` _(Default)_: O usuário está enjaulado aos recursos que contenham o seu `team_id` atual (Equivalente ao comportamento padrão do sistema vigente).
3.  `user`: O usuário só enxergará/manipulará entidades que obrigatoriamente incluam explicitamente seu `user_id` (Isolado individualmente).

### Impacto e Execução Técnica

- **UI (Controle de Acessos):** No componente de matriz de Permissões nas posições/perfis, adicionaremos uma nova coluna de _dropdown_ "Scope". Para facilitar a usabilidade gerencial, mudar o Scope alterará o contexto inteiro daquela tela de uma vez (evitando anomalias como _ver_ tudo (`all`) mas só _criar_ para o seu time (`team`)).
- **Mapeamento de Restrição (`permissions.ts` e C# Backend):** Nem toda tabela possui relacionamento com `team_id` ou `user_id` (Exemplo: Tabela "Sistema Settings" é universal). Portanto, no arquivo estático de configuração, documentaremos quais _Scopes_ estão habilitados para quais _Telas_, de forma a evitar que a API receba filtros inconsistentes.
- **API (Filtro Dinâmico Global):** Desenvolveremos validações baseada na Request nas queries do Entity Framework. A camada da API negará dados se a claim de RBAC estiver atrelada a "team" e o Payload apontar inserção para outro TeamId diferente do contido no Token JWT, blindando o ambiente.

## 5. Resumo da API Planejada

1.  **Privada (Requer Permissão + RBAC + Scope Verification):**
    - `GET /api/v1/admin/projects` (Listar projetos interceptado por **Scope**)
    - `GET /api/v1/admin/projects/{id}`
    - `POST /api/v1/admin/projects` (Criar)
    - `PUT /api/v1/admin/projects/{id}` (Update / Rotação de Token)
    - `DELETE /api/v1/admin/projects/{id}` (Soft delete)
2.  **Pública (Apenas Requer o Header Token Ativo):**
    - `POST /api/v1/public/feedbacks` (Recebe payload de nota e faz Upsert)
