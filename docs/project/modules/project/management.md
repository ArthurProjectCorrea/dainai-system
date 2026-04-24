# Módulo de Projetos - Gerenciamento

Este módulo centraliza a organização dos projetos do sistema, servindo como o agrupador principal para documentos e definições de equipe.

## Definição de Projeto

Um Projeto no DAINAI não é apenas uma pasta, mas um contexto de conhecimento que possui:
- **Identidade**: Nome e um resumo/sumário que descreve seu propósito.
- **Propriedade**: Vinculação direta a uma Equipe (Team).
- **Segurança**: Token de acesso único para integrações externas.
- **Configuração de Navegação**: Estrutura personalizada da sidebar na Wiki.

## Operações Principais

### 1. Cadastro
Ao cadastrar um projeto, o administrador define o time proprietário. O projeto herda as restrições de visibilidade baseadas no time do usuário logado.

### 2. Monitoramento (Dashboard)
A tela de listagem exibe indicadores de saúde e progresso do projeto baseados no volume de documentos e atividade recente.

### 3. Token de Projeto
Cada projeto possui um Token único.
- **Rotação de Token**: É possível gerar um novo token caso o atual seja comprometido.
- **Uso**: O token é utilizado para autenticar chamadas de API externas que desejam consultar ou atualizar documentos deste projeto.

## Regras de Negócio (RBAC)

| Ação | Permissão Requerida |
| :--- | :--- |
| Visualizar Projetos | `projects_management:view` |
| Criar Projeto | `projects_management:create` |
| Editar Projeto | `projects_management:update` |
| Excluir Projeto | `projects_management:delete` |

## Relacionamentos
- **1:N com Documentos**: Um projeto contém múltiplos documentos.
- **N:1 com Teams**: Múltiplos projetos podem pertencer a um mesmo Time.
