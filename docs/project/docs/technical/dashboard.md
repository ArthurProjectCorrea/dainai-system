# Especificação Técnica Unificada: Dashboard e Navegação Global

**Módulo Referência:** [admin.md](../admin.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Visão Geral, Contexto de Times e BI)
**Categorias:** Dashboard, Analytics, Administração

---

## 1. Visão Geral e Contexto
Este documento unifica a especificação do "Home Office" do sistema. O Dashboard fornece indicadores de BI sobre a saúde do conhecimento e dos projetos, enquanto a Navegação Global (Sidebar) gerencia a alternância entre diferentes contextos organizacionais (Multi-tenancy) e o controle de acesso visual (RBAC).

## 2. Controle de Acesso e Multi-tenancy

### 2.1 Seletor de Contexto (`TeamSwitcher`)
* **Multi-tenancy:** Permite que usuários com múltiplos vínculos troquem de time instantaneamente.
* **Mecanismo:** A troca de time atualiza o cookie `active_team_id`, disparando o recarregamento das permissões do usuário para o novo contexto através do endpoint `/me`.

### 2.2 Menu Dinâmico e RBAC Visual
* **Filtragem em Tempo Real:** A Sidebar consome a matriz de acessos do `AuthProvider`. Itens de menu só são renderizados se a permissão `view` estiver presente para a respectiva `name_key`.
* **Rótulos Dinâmicos:** Os nomes dos menus na Sidebar seguem o campo `name_sidebar` vindo do banco de dados, permitindo personalização da nomenclatura sem deploys de código.

---

## 3. Especificação de Interface e BI

### 3.1 Indicadores Analíticos (Dashboard)
O Dashboard é dividido em seções granulares:
* **Métricas de Projetos:** Total, Ativos, Feedbacks e Média de Satisfação.
* **Métricas de Wiki:** Health score (Publicados vs Rascunhos), densidade de categorias e volume por projeto.
* **Carregamento Condicional:** Se o usuário não tem permissão de `view` em Projetos, a seção respectiva do Dashboard não é carregada, garantindo privacidade de dados.

### 3.2 Visualizações e Gráficos
* **Distribuição de Notas:** Gráfico comparativo de feedbacks.
* **Trends:** Ranking dos 5 projetos com melhor performance no período.

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Agregação de Dados (`DashboardService`)
1.  **Scope-Aware Aggregation:** Os indicadores são calculados dinamicamente filtrando pelo `activeTeamId` e pelo nível de escopo do usuário (Global vs Time).
2.  **Performance:** Utiliza consultas agregadas (`Count`, `Average`) no SQL Server com tratamento para valores nulos para evitar falhas em projetos sem dados.

---

## 5. Ciclo de Vida e Sessão
* **Persistência de Contexto:** O time selecionado na Sidebar é persistido na sessão. Todas as requisições de API subsequentes (Dashboard, Docs, etc.) herdam este contexto via Header `X-Active-Team-Id`.
* **Profile User Menu:** Atalho para logout e configurações de perfil, limpando chaves de cache no Redis ao encerrar a sessão.

---

## 6. Persistência e Modelagem
* **Tabelas:** `Teams` (Contexto), `Profiles` (Dados do Usuário), `Projects` e `Documents` (Origem dos Indicadores).
* **Cache Layer:** A Sidebar e o Dashboard dependem da integridade do cache de RBAC no Redis para refletir mudanças de permissão instantaneamente.
