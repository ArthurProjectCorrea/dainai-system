# Changelog - Web (2026-04-15)

## 🆕 Novas Funcionalidades

### 🔐 Estabilização do Módulo de Controle de Acesso

- Novo layout padronizado de largura total para listagem e formulários.
- Implementação de formulários em Grid (2 colunas) para informações básicas.
- Suporte a criação dinâmica de departamentos integrando `CreatableCombobox` com a API.
- Padronização de nomes amigáveis no dropdown de visibilidade de colunas da `DataTable`.

### 🧩 Novos Componentes

- **CreatableCombobox**: Componente reutilizável para seleção com suporte a criação inline de novas entidades.

## 🛠️ Refatorações e Qualidade

- **Estabilização de Build**: Implementação de limites de `<Suspense>` em todas as rotas que utilizam `useSearchParams` para evitar erros de renderização estática do Next.js.
- **Limpeza de Lint**: Redução agressiva de avisos e erros de TypeScript e ESLint no diretório `apps/web`. Substituição de tipos `any` por interfaces rigorosas.
- **Navegação**: Limpeza de URLs de navegação (remoção de queries desnecessárias como `?type=position`).

## 🐛 Correções de Bugs

- Corrigido erro de referência `cn is not defined` no componente `AccessControlForm`.
- Corrigido erro de parsing JSX causado por tags não terminadas.
- Corrigida exibição de nomes técnicos no menu de colunas da tabela.
