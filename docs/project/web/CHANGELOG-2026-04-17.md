# Changelog - Web - 2026-04-17

## 🚀 Melhorias de Qualidade e Estabilização

### Infraestrutura e Build

- **Estabilização do Turborepo**: Atualizado binário do `turbo` para resolver erros de `spawnSync` em ambientes Windows com Node 24.
- **Correções de Build**: Resolvidos todos os erros de TypeScript que impediam o build de produção (`next build`).
- **Limpeza de Lint**: Eliminados avisos de `any` explícito no componente de gráficos (`project-chart.tsx`) e em componentes de tabela.

### Arquitetura de Componentes

- **DataTable Tipada**: Refatoração completa da árvore de componentes da `DataTable` para suportar propagação genérica de `<TData>`. Isso garante que colunas, filtros e ações tenham acesso tipado aos dados originais.
- **Filtros Avançados**: Implementação do `DataTableDetailedFilter` e `DataTableQuickFilter` integrados à arquitetura genérica.

### Roteamento e UX

- **Consolidação Administrativa**: O módulo de Controle de Acesso foi migrado para o padrão de rota catch-all (`[...action]`), unificando a lógica de criação, edição e visualização.
- **Skeleton Loading**: Expansão do uso de skeletons em tabelas para melhorar a percepção de performance durante o carregamento de dados.

---

> [!NOTE]
> Esta atualização foca na robustez técnica e consistência entre os módulos administrativos.
