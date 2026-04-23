# Especificação Técnica Unificada: Gestão de Usuários (Admin)

**Módulo Referência:** [admin.md](../admin.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Listagem, Indicadores e Cadastro)
**Categorias:** Administração, Gestão de Usuários, Identity

---

## 1. Visão Geral e Contexto
Este documento unifica as especificações de listagem e gerenciamento de usuários. A página de usuários é o núcleo da gestão de identidades do sistema, orquestrando desde a visualização de indicadores de adoção até a criação de credenciais no **ASP.NET Identity** e fluxos de convite via e-mail.

## 2. Controle de Acesso e Permissões (RBAC)

### 2.1 Camada de Interface (Front-end)
O acesso à gestão de usuários é controlado granurlarmente:
* **Visualização (Listagem):** Requer `users_management:view`.
* **Criação (Novo Usuário):** Requer `users_management:create`.
* **Edição (Formulário):** Requer `users_management:update`.
* **Exclusão:** Requer `users_management:delete`.
* **Convites:** O reenvio de convite exige permissão de atualização (`update`).

### 2.2 Camada de API (Back-end)
* **Validação Scoped:** A listagem respeita o escopo de visibilidade do cargo do usuário (Global vs Time). Administradores de time visualizam apenas colaboradores de seus respectivos times.
* **HasPermission:** Todos os endpoints utilizam o atributo `[HasPermission("users_management", "action")]`.

---

## 3. Especificação de Interface e Validações UI

### 3.1 Tela Principal (Listagem e Indicadores)
* **Indicadores Dinâmicos:** Exibe cards com Total, Ativos e Inativos, calculados em tempo real pela API.
* **Tabela de Usuários:** Utiliza TanStack Table com busca client-side por e-mail.
* **Coluna de Vínculos:** Mapeia o array de `assignments` para exibir o par **[Time] - [Cargo]** em um componente de Tooltip/Popover.

### 3.2 Formulário de Cadastro e Edição (`UserForm`)
* **Validações Síncronas:** Nome e E-mail (RFC 5322) são obrigatórios. Deve haver pelo menos uma atribuição de time válida.
* **Gestão de Avatar:** Upload assíncrono via `/api/v1/storage/upload`. A imagem antiga é deletada fisicamente do storage ao salvar uma nova.

---

## 4. Fluxo de Execução da API (Back-end)

### 4.1 Criação de Usuário (`CreateUserAsync`)
1.  **Identity + Profile:** Cria o registro em `AspNetUsers` (Identity) e `Profiles` (Domain) sob a mesma transação.
2.  **Senha Temporária:** Gera uma senha complexa aleatória.
3.  **Convite via Redis:** Armazena um token de ativação no Redis (prefixo `reset_`) com validade de 7 dias e dispara o e-mail.

### 4.2 Reenvio de Convite
1.  **Invalidação:** Gera um novo token no Redis, invalidando qualquer link anterior.
2.  **Audit:** Registra o disparo para controle de spam administrativo.

### 4.3 Sincronização de Vínculos (`UpdateUserAsync`)
1.  **Estratégia:** Realiza um `RemoveRange` nos vínculos atuais e insere os novos (`assignments`) enviados no payload.
2.  **Segurança:** Atualiza o `SecurityStamp` do usuário, forçando o logout em outros dispositivos se houver mudanças críticas.

---

## 5. Ciclo de Vida e Deleção de Dados

### 5.1 Soft Delete (Deleção Lógica)
O sistema preserva a integridade histórica marcando o usuário como excluído em vez de removê-lo fisicamente.
* **Ações:**
    1. Define `DeletedAt` e `IsActive = false`.
    2. **Lockout Identity:** Ativa o bloqueio permanente no ASP.NET Identity (`LockoutEnabled = true`).
    3. **Cleanup:** Remove o arquivo físico do avatar e limpa chaves de RBAC no Redis.

---

## 6. Persistência e Modelagem
* **Tabelas:** `AspNetUsers` (Identity), `Profiles` (Negócio), `ProfileTeams` (Vínculos N:N).
* **Performance:** Consultas utilizam `Include` aninhado para evitar o problema de N+1 ao listar vínculos de múltiplos times.
