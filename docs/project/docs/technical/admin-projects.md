# Especificação Técnica Unificada: Gestão de Projetos (Admin)

**Módulo Referência:** [project.md](../project.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Listagem, Token de Integração e Sidebar Wiki)
**Categorias:** Projetos, Gestão de Conteúdo, Configuração

---

## 1. Visão Geral e Contexto
Este documento unifica a gestão dos contextos de conhecimento do sistema. A interface de Projetos define os agrupadores de documentos e gerencia a segurança de integrações externas através de **Tokens de Integração**, além de orquestrar a estrutura de navegação lateral da Wiki.

## 2. Controle de Acesso e Multi-tenancy (RBAC)

### 2.1 Camada de Interface (Front-end)
* **Visualização:** Requer `projects_management:view`.
* **Edição/Configuração:** Requer `projects_management:update`.
* **Exclusão:** Requer `projects_management:delete`.

### 2.2 Camada de API (Back-end)
* **Escopo Team (Padrão):** Filtra projetos onde `TeamId == X-Active-Team-Id`.
* **Escopo All:** Permite gestão global por super-administradores.
* **Segurança de Token:** O token de integração é protegido e exibido apenas em fluxos de rotação explícita.

---

## 3. Especificação de Interface e Validações UI

### 3.1 Tela Principal (Listagem e Performance)
* **Indicadores:** Cards com Total de Projetos, Projetos Ativos e Inativos.
* **Métricas de Feedback:** A listagem exibe a média de satisfação (1-5 estrelas) consolidada para cada projeto.
* **Busca:** Filtro textual por nome do projeto.

### 3.2 Configuração de Projeto e Sidebar (`ProjectForm`)
* **Metadados:** Nome e Resumo (Summary) são obrigatórios.
* **Interface da Sidebar:** Sistema de "Arrastar e Soltar" (ou similar) para criar Grupos e organizar Documentos.
* **Validação de Integridade:** Impede a vinculação de documentos que não pertencem ao projeto ou que foram excluídos.

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Gestão de Tokens de Integração
1.  **Geração Segura:** Utiliza `RandomNumberGenerator` (32 bytes) para criar tokens de alta entropia.
2.  **Rotação (`RotateTokenAsync`):** Gera um novo token e invalida o anterior imediatamente. O token novo é retornado uma única vez para cópia do usuário.

### 4.2 Sincronização de Sidebar (`UpdateProjectAsync`)
* **Estratégia "Reconstruction":** 
    1. Remove todos os `ProjectSidebarGroups` e `ProjectSidebarItems` atuais.
    2. Recria toda a estrutura hierárquica baseada no novo payload da UI.
    3. Atribui novos IDs e preserva a ordem sequencial (`Order`).

---

## 5. Ciclo de Vida e Deleção de Dados

### 5.1 Soft Delete (`DeleteProjectAsync`)
* **Ação:** Marca o projeto com `DeletedAt`.
* **Impacto:** O projeto e sua respectiva Wiki param de ser listados. Documentos vinculados permanecem no banco para histórico, mas perdem sua rota de navegação principal.

---

## 6. Persistência e Modelagem
* **Tabelas:** `Projects` (Raiz), `ProjectSidebarGroups` (Pastas), `ProjectSidebarItems` (Links de Docs), `ProjectFeedbacks` (Métricas Externas).
* **Escopo:** O isolamento multi-tenant é garantido via `TeamId` em todas as consultas transacionais.
