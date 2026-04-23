# Especificação Técnica Unificada: Controle de Acesso e RBAC (Admin)

**Módulo Referência:** [admin.md](../admin.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Governança, Matriz de Permissões e Escopos)
**Categorias:** Administração, Segurança, RBAC

---

## 1. Visão Geral e Contexto
Este documento unifica a gestão da infraestrutura de permissões do sistema. A interface de Controle de Acesso gerencia a Matriz RBAC (Role-Based Access Control), definindo o que cada **Cargo** pode realizar em cada **Tela**, operando em diferentes **Escopos** de dados.

### 1.1 Conceito de Escopo
O sistema segrega dados em três níveis de visibilidade:
1.  **Global (All):** Acesso irrestrito a todos os times (Super-admins).
2.  **Equipe (Team):** Acesso restrito aos dados do time ativo selecionado.
3.  **Usuário (User):** Acesso restrito apenas aos dados criados pelo próprio usuário.

---

## 2. Controle de Acesso e Permissões (RBAC)

### 2.1 Camada de Interface (Front-end)
* **Acesso à Tela:** Requer permissão `access_control:view`.
* **Segurança da Matriz:** Utiliza o utilitário `isPermissionSupported(screen, permission)` para desabilitar checkboxes que não possuem lógica de negócio aplicada (ex: "Excluir" em Dashboards).

### 2.2 Camada de API (Back-end)
* **Agregação de Domínios:** O endpoint `/access-control` consolida Cargos, Departamentos, Telas e Permissões em um único payload para montagem da matriz.
* **Integridade:** Bloqueia a exclusão de cargos que possuam usuários vinculados na tabela `ProfileTeams`.

---

## 3. Especificação de Interface e Validações UI

### 3.1 Listagem e Indicadores
* **Cards de BI:** Exibe o total de Departamentos, Cargos e Telas rastreáveis.
* **Tabela de Cargos:** Mapeia cargos a seus departamentos. Permite busca textual por nome.

### 3.2 Formulário de Matriz (`AccessControlForm`)
* **CreatableCombobox:** Permite selecionar departamentos existentes ou criar novos "on-the-fly" digitando o nome.
* **Seleção em Lote:** O checkbox "Todas" na linha da tela marca apenas as permissões suportadas por aquele módulo específico.
* **Gestão de Escopo:** O seletor de escopo é exibido condicionalmente para telas que suportam segregação (ex: Documentos e Projetos).

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Persistência de Cargo e Acessos
1.  **Resolução de Departamento:** Se for um departamento novo, a API o cria antes de salvar o cargo.
2.  **Sincronização "Clear and Replace":**
    * Remove todos os registros atuais da tabela `Accesses` vinculados ao ID do cargo.
    * Insere o novo conjunto de registros vinculando `ScreenId`, `PermissionId` e `Scope`.
3.  **Invalidação de RBAC:** Invalida de forma assíncrona o cache do Redis de todos os usuários afetados pela mudança do cargo para garantir a propagação imediata das novas regras.

---

## 5. Ciclo de Vida e Deleção de Dados

### 5.1 Regras de Exclusão (`DeletePositionAsync`)
* **Hard Delete:** O cargo é removido fisicamente se, e somente se, não houver nenhum usuário vinculado a ele em nenhum time do sistema.
* **Cascateamento:** A remoção do cargo dispara a exclusão automática de suas entradas na tabela `Accesses`.

---

## 6. Persistência e Modelagem
* **Tabelas:** `Departments`, `Positions`, `Screens`, `Permissions`, `Accesses`.
* **Fluxo de Cache:** Utiliza chaves versionadas no Redis (`rbac_v4_{userId}`) para armazenar a matriz de permissões final resolvida para cada usuário em cada time.
