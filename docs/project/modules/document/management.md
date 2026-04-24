# Módulo de Documentos - Gerenciamento

Este módulo é responsável por todo o ciclo de vida dos documentos no sistema, desde a criação do rascunho até o arquivamento e exclusão.

## Fluxo de Gerenciamento

O gerenciamento de documentos é restrito a usuários com permissão `documents_management`.

### 1. Listagem e Filtros
A tela principal do módulo permite visualizar todos os documentos do sistema (ou filtrados por time/projeto).
- **Indicadores**: Exibe o total de documentos, publicados e rascunhos.
- **Busca**: Permite busca por nome ou conteúdo.
- **Filtros Avançados**: Filtro por Projeto, Categoria, Status (Publicado/Rascunho) e Data de Criação.

### 2. Criação de Documentos
Ao criar um documento, o usuário deve definir:
- **Título**: Nome identificador do documento.
- **Projeto**: A qual projeto este documento pertence.
- **Categorias**: Tags para organização (Ex: Técnico, Manual, Regra de Negócio).
- **Conteúdo**: Editor Markdown para escrita do documento.

### 3. Edição e Rascunhos
Qualquer alteração em um documento que não seja explicitamente publicada é salva como um estado atual do documento. 
- Se o documento já está publicado, a edição altera o rascunho de trabalho, mas não afeta a versão pública até que uma nova publicação seja realizada.

### 4. Exclusão
A exclusão de um documento remove todos os seus rascunhos e versões publicadas permanentemente.

## Regras de Negócio (RBAC)

| Ação | Permissão Requerida |
| :--- | :--- |
| Visualizar Lista | `documents_management:view` |
| Criar Documento | `documents_management:create` |
| Editar Documento | `documents_management:update` |
| Excluir Documento | `documents_management:delete` |

## Integração com Projetos
Cada documento deve estar obrigatoriamente vinculado a um Projeto. A visibilidade do documento na Wiki pública depende da configuração de sidebar do projeto ao qual ele pertence.
