# Especificação Técnica Unificada: Portal de Conhecimento (Wiki)

**Módulo Referência:** [wiki.md](../wiki.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Descoberta, Leitura e Navegação)
**Categorias:** Wiki, Consumo, Experiência do Usuário

---

## 1. Visão Geral e Contexto
Este documento unifica a especificação do portal de consumo de conhecimento. A Wiki é projetada para ser a "Fonte Única da Verdade" para os times, oferecendo uma experiência de leitura premium com suporte a Markdown, diagramas Mermaid e versionamento histórico imutável.

## 2. Controle de Acesso e Segurança (Multi-tenancy)

### 2.1 Camada de Interface (Front-end)
* **Acesso Público Interno:** Qualquer usuário autenticado pode ler documentos do seu time ativo. Não requer permissões administrativas.
* **Isolamento:** Utiliza o `DocsProvider` para garantir que a navegação e a busca fiquem restritas ao contexto do projeto e time selecionados.

### 2.2 Camada de API (Back-end)
* **Segurança de Time:** A rota `/api/v1/docs` valida se o projeto pertence ao `activeTeamId` do usuário, impedindo acesso via manipulação de ID.
* **Filtro de Versão:** Consome exclusivamente a tabela `PublishedDocuments`, ignorando rascunhos salvos na tabela `Documents`.

---

## 3. Especificação de Interface e Funcionalidades

### 3.1 Catálogo de Projetos (Dashboard da Wiki)
* **Descoberta:** Exibe cards de todos os projetos ativos do time com seus respectivos resumos (`Summary`).
* **Busca Global:** Barra de pesquisa que percorre títulos e conteúdos de todos os documentos publicados do time.

### 3.2 Visualização de Documento (`WikiPage`)
* **Renderização MDX:** Processa Markdown com destaque de sintaxe e renderização de diagramas **Mermaid**.
* **Navegação Interna (TOC):** Gera automaticamente uma "Table of Contents" baseada nos headers do documento para navegação via âncoras.
* **Seletor de Versões:** Permite navegar no histórico de snapshots, carregando conteúdos imutáveis do passado.

### 3.3 Barra Lateral de Navegação (Sidebar)
* **Dinamicidade:** Montada dinamicamente com base na configuração definida no [admin-projects.md](admin-projects.md).
* **Agrupamento:** Organiza documentos em pastas/grupos com ícones customizados.

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Busca de Documento Oficial (`GetPublishedDocumentByIdAsync`)
1.  **Late Binding:** Localiza o registro mais recente (ou a versão específica solicitada) na tabela `PublishedDocuments`.
2.  **Imutabilidade:** O conteúdo retornado é um snapshot estático, garantindo que a Wiki não mude enquanto um editor está salvando rascunhos.

### 4.2 Mecanismo de Busca (`SearchDocumentsAsync`)
* **Algoritmo:** Utiliza `EF.Functions.ILike` para busca textual parcial (insensível a case) no Título e Conteúdo.

---

## 5. Persistência e Modelagem
* **Snapshotting:** O portal isola o ambiente de leitura (Wiki) do ambiente de escrita (Admin).
* **Navegação:** A árvore de navegação é otimizada em uma única chamada de API (`/navigation`) que retorna a estrutura hierárquica completa dos projetos e documentos do time.
