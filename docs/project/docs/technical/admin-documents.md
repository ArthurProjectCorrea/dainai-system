# Especificação Técnica Unificada: Gestão de Documentos (Admin)

**Módulo Referência:** [document.md](../document.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Rascunho, Edição MDX e Publicação)
**Categorias:** Documentação, Editor, Gestão de Conhecimento

---

## 1. Visão Geral e Contexto
Este documento unifica a gestão do ciclo de vida do conhecimento no sistema. A interface de documentos permite que editores criem, revisem e oficializem informações através de um editor Markdown avançado, garantindo que apenas versões aprovadas (Snapshots) cheguem à Wiki pública.

## 2. Controle de Acesso e Permissões (RBAC)

### 2.1 Camada de Interface (Front-end)
* **Visualização (Listagem):** Requer `documents_management:view`.
* **Criação:** Requer `documents_management:create`.
* **Edição (Editor):** Requer `documents_management:update`.
* **Publicação (Aprovação):** Requer `documents_management:approve`. Usuários sem esta permissão podem apenas salvar rascunhos.
* **Exclusão:** Requer `documents_management:delete`.

### 2.2 Camada de API (Back-end)
* **Isolamento de Time:** A API filtra documentos baseando-se no `activeTeamId` do header.
* **Validação de Snapshot:** Apenas usuários com a permissão `approve` podem disparar a rota de publicação que gera uma nova versão imutável.

---

## 3. Especificação de Interface e Validações UI

### 3.1 Tela Principal (Listagem e Governança)
* **Indicadores de Status:** Cards exibindo o total de Documentos, Publicados e Rascunhos.
* **Tabela de Gestão:** Exibe badges de status (`Published` vs `Draft`) e permite acesso rápido ao editor.
* **Lazy Loading:** A listagem não carrega o conteúdo Markdown por performance.

### 3.2 Editor de Conhecimento (`DocumentForm`)
* **Validações:** Título e Conteúdo são obrigatórios.
* **Recursos do Editor (`md-editor-rt`):**
    * Suporte a diagramas **Mermaid**, tabelas e realce de sintaxe.
    * Upload de imagens via `/api/v1/storage/upload` com injeção automática da URL no Markdown.

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Ciclo de Vida do Rascunho (`UpdateDocumentAsync`)
* **Regra de Invalidação (RN10):** Se um documento já publicado for editado e salvo, o sistema altera seu status automaticamente para **`Draft`**. Isso força uma nova rodada de revisão antes que as mudanças reflitam na Wiki.

### 4.2 Fluxo de Publicação (Snapshotting)
1.  **Versão:** Calcula o próximo identificador sequencial (ex: `v2`).
2.  **Snapshot:** Cria um registro imutável na tabela `PublishedDocuments` com a cópia exata do Markdown atual.
3.  **Auto-Navegação:** Se o documento não estiver na Sidebar do projeto, o sistema o insere automaticamente no grupo **"Outros"** para garantir visibilidade imediata.

---

## 5. Ciclo de Vida e Deleção de Dados

### 5.1 Deleção em Cascata (`DeleteDocumentAsync`)
* **Soft Delete:** Marca o documento como excluído (`DeletedAt`).
* **Propagação:** Aplica o soft-delete a todas as versões históricas (Snapshots) vinculadas, removendo-as da Wiki e das buscas.

---

## 6. Persistência e Modelagem
* **Tabelas:** `Documents` (Rascunhos), `PublishedDocuments` (Histórico Oficial), `Categories`.
* **Estratégia de Leitura:** A Wiki consome exclusivamente os registros da tabela `PublishedDocuments`, ignorando rascunhos em andamento na tabela principal.
