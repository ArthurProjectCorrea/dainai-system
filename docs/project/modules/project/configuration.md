# Módulo de Projetos - Configuração de Sidebar

A flexibilidade do DAINAI reside na capacidade de cada projeto organizar sua Wiki de forma única através do configurador de Sidebar.

## Estrutura da Sidebar

A sidebar de um projeto é composta por **Grupos**. Cada grupo pode ser de um dos seguintes tipos:

| Tipo | Descrição | Uso Recomendado |
| :--- | :--- | :--- |
| **Solo** | Um único documento exibido diretamente com ícone. | Documentos principais (ex: Roadmap). |
| **List** | Uma lista simples de documentos sob um título de grupo. | Categorias planas de documentos. |
| **Collapse** | Um menu expansível que agrupa documentos em uma árvore. | Organização complexa ou temática. |
| **Dropdown** | Um menu compacto de ações (mais comum para links externos ou utilitários). | Links de referência ou ferramentas. |

## Fluxo de Configuração

1. **Seleção de Documentos**: O usuário escolhe quais documentos já criados farão parte da navegação.
2. **Ordenação**: Arrastar e soltar para definir a ordem dos grupos e dos itens dentro dos grupos.
3. **Personalização Visual**: Escolha de ícones (biblioteca Lucide) para cada grupo.
4. **Sincronização**: Ao salvar, a Wiki do projeto é atualizada instantaneamente para todos os usuários com acesso.

## Vantagens do Modelo
- **Independência**: Um documento pode existir no sistema mas não estar na sidebar (acessível apenas via busca).
- **Contexto**: Facilita a navegação do usuário final ao esconder complexidades administrativas.
- **Dinâmico**: Mudanças na estrutura da equipe podem ser refletidas na documentação sem alterar os arquivos físicos.
