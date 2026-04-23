# Especificação Técnica Detalhada: Gestão de Equipes (Multi-tenancy Root)

**Módulo Referência:** [admin.md](../admin.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Multi-tenancy + Gestão de Assets + Integridade)
**Categorias:** Administração, Infraestrutura, Multi-tenancy

---

## 1. Visão Geral e Contexto
A Entidade **Team** é o pilar de isolamento (Multi-tenancy) do sistema. Quase todos os dados (Projetos, Documentos, Permissões de Usuário) são filtrados através do vínculo com um Time. Esta tela gerencia as unidades de negócio da plataforma.

## 2. Controle de Acesso e Permissões (RBAC)

### 2.1 Camada de Interface (Front-end)
O acesso à gestão de equipes é restrito por:
* **Visualização:** `teams_management:view`.
* **Criação/Edição:** `teams_management:create` / `update`.
* **Exclusão:** `teams_management:delete`.

### 2.2 Camada de API (Back-end)
* A API utiliza validações globais para garantir que apenas administradores com escopo `all` ou permissões específicas de gestão de time possam alterar estas entidades fundamentais.

---

## 3. Especificação de Interface e Validações UI

### 3.1 Componente `TeamForm`
* **Campos Principais:**
    * **Nome da Equipe:** Obrigatório.
    * **Logotipo (Horizontal):** Utilizado no cabeçalho do sistema.
    * **Ícone (Quadrado):** Utilizado no seletor de times (TeamSwitcher).
* **Validações de Assets:**
    * Os uploads de imagens são processados assincronamente. A UI valida o tamanho máximo (2MB) para evitar consumo excessivo de storage.

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Processamento de Imagens (`UpdateTeamAsync`)
O Back-end implementa uma lógica de **Garbage Collection** manual para arquivos:
1.  **Comparação:** Antes de salvar a nova URL do ícone ou logotipo, o serviço compara com o valor atual no banco de dados.
2.  **Limpeza:** Se a URL for diferente (mudança de arquivo), o `IFileService` é acionado para remover o arquivo órfão do sistema de arquivos físico, evitando o acúmulo de lixo digital.

### 4.2 Criação e Inicialização (`CreateTeamAsync`)
1.  **Registro:** Insere o time na tabela `Teams`.
2.  **Estado Inicial:** Times são criados como `IsActive = true` por padrão, tornando-os imediatamente disponíveis no seletor de contextos para usuários autorizados.

---

## 5. Ciclo de Vida e Deleção de Dados

### 5.1 Restrição de Integridade (`DeleteTeamAsync`)
Equipes são o nó central de muitos relacionamentos. Por segurança:
1.  **Bloqueio de Exclusão:** O sistema verifica na tabela `ProfileTeams` se existe algum usuário (perfil) vinculado a este time.
2.  **Regra:** Se houver um único vínculo ativo, a exclusão é abortada com erro 400. O administrador deve primeiro mover ou remover os usuários do time.
3.  **Soft Delete:** Caso a exclusão seja permitida, o time é marcado com `DeletedAt`, ocultando-o de seletores e dashboards, mas preservando o histórico para auditoria.

---

## 6. Persistência e Modelagem
* **Tabela Raiz:** `Teams`.
* **Relacionamentos Críticos:**
    * `ProfileTeams`: Define quem pode "entrar" no time e com qual cargo.
    * `Projects`: Todos os projetos pertencem a exatamente um time.
* **Isolamento:** O `active_team_id` armazenado nos cookies do Front-end é a chave primária usada pelo Back-end para filtrar todas as consultas subsequentes (Docs, Projetos, etc).
