# Changelog - API (2026-04-15)

## 🆕 Novas Funcionalidades

### 🏢 Criação Dinâmica de Departamentos

- Implementada lógica no `AdminService` para permitir a criação automática de departamentos durante a criação de cargos.
- Adicionado campo `NewDepartmentName` ao `SavePositionRequest`.
- Implementada busca case-insensitive por nomes de departamentos existentes para evitar duplicidade.

### 🔐 Estabilização do Controle de Acesso

- Atualizado o endpoint de criação/edição de cargos para aceitar uma matriz explícita de acessos (`List<Access>`).
- Consolidação do `AccessControlResponse` para incluir dados de cargos, departamentos, telas e permissões em uma única chamada.

## 🛠️ Refatorações e Melhorias

- **DTOs**: Padronização dos objetos de transferência de dados (`SavePositionRequest`, `PositionResponse`).
- **Performance**: Otimização do carregamento da matriz RBAC com eager loading em `GetAccessControlAsync`.

## 🐛 Correções de Bugs

- Corrigida inconsistência onde `screenPermissions` retornava apenas IDs de permissão sem contexto de tela.
- Ajustada a validação de nomes duplicados em departamentos dinâmicos.
