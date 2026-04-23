# Especificação Técnica: Tela [Nome da Tela Principal] e Fluxos Associados

**Módulo Referência:** [Link para o Documento de Conceito do Módulo .md]
**Link do Protótipo:** [Link exato para a página/frame no Figma]
**Responsável Técnico:** [Nome]

---

## 1. Visão Geral da Interface
*Resumo do que esta interface compõe (ex: "Grid principal de listagem com filtros avançados, acompanhada de um modal de criação rápida e uma tela subsequente de perfil detalhado").*
* **Stack/Padrões:** [Front-end, Back-end, Bibliotecas específicas para esta tela].

## 2. Contratos de API (Endpoints da Tela)
*Todas as chamadas de rede que partem desta tela e de seus subfluxos.*

| Ação na UI | Método | Endpoint | Payload / Query |
| :--- | :--- | :--- | :--- |
| Carregar Grid | `GET` | `/api/v1/recurso` | `?page=1&size=50&status=active` |
| Salvar Modal | `POST` | `/api/v1/recurso` | `CreateRecursoCommand` |

---

## 3. Especificação: Tela Principal ([Nome da Tela])

### 3.1 Ação de Carregamento (OnLoad)
* O que acontece assim que a rota é acessada? (Ex: Fetch de dados, carregamento de listas de domínio para os selects de filtro, inicialização de estado global).

### 3.2 Mapeamento de Componentes e Filtros
* **[Nome do Componente/Filtro]:** * **Comportamento:** (Ex: Filtro multi-select com debounce de 500ms na digitação).
* **[Tabela / Grid de Dados]:**
    * **Colunas:** Quais propriedades da DTO alimentam cada coluna.
    * **Ordenação:** Quais colunas permitem *sort* no Back-end.

### 3.3 Ações Globais (Botões Principais)
* **Botão [Nome]:** Dispara a abertura do [Modal/Drawer/Tela Subsequente].

---

## 4. Especificação: Telas Subsequentes e Modais
*(Crie uma subseção para cada interação complexa que deriva da tela principal)*

### 4.1 Modal / Tela de Cadastro: [Novo Recurso]
* **Comportamento de Abertura:** Limpar formulário ou carregar rascunho salvo?
* **Mapeamento de Campos (Inputs):**
    * **[Nome do Campo]:** Obrigatório? Possui máscara (ex: CPF/CNPJ)? Validação específica de Front-end?
* **Ação de Submissão (Salvar):**
    * Dispara o `POST`. Em caso de sucesso (200/201), fechar modal, exibir toast de sucesso e invalidar o cache da grid principal para forçar recarregamento.

### 4.2 Tela de Detalhes: [Visualização do Recurso]
* **Navegação:** Acessada pelo clique na linha da Grid Principal. A URL deve refletir o ID (`/recurso/{id}`).
* **Carregamento:** Buscar DTO detalhada via `GET /api/v1/recurso/{id}`.
* **Componentes Específicos:** Detalhar regras de exibição (ex: abas internas, botões de inativação).

---

## 5. Lógica de Back-end e Regras de Negócio
*Como o Back-end processa os Commands e Queries originados por esta tela.*

* **Command: `[NomeDoCommand]` (Originado no Cadastro):**
    * **Validações de Entrada (FluentValidation):** Quais são as regras de rejeição imediata (400 Bad Request)?
    * **Regra Lógica:** [Explicação técnica de como a regra de negócio validada no conceito é executada no código. Ex: Cálculos matemáticos, verificações de duplicidade no banco].
    * **Eventos Gerados:** Dispara algum Domain Event após o sucesso?

## 6. Persistência e Modelagem de Dados
*Impactos no banco de dados referentes a esta tela.*
* **Tabelas / Entidades:** Quais tabelas são lidas ou escritas.
* **Observações de Performance:** Necessidade de índices específicos para suportar os filtros da grid principal.