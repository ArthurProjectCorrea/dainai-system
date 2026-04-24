# Módulo de Documentos - Publicação e Versionamento

O sistema DAINAI utiliza um modelo de publicação para garantir que apenas conteúdos revisados e aprovados cheguem à Wiki pública.

## Processo de Publicação

1. **Estado Inicial (Rascunho)**: Todo documento nasce como um rascunho. Ele é visível apenas no painel administrativo de Gerenciamento de Documentos.
2. **Ação de Publicar**: Ao clicar em "Publicar", o conteúdo atual do rascunho é congelado e salvo como uma nova **Versão Publicada**.
3. **Visibilidade**: Apenas a versão marcada como "Atual" (geralmente a última publicada) é exibida na Wiki para os usuários da equipe.

## Versionamento

Cada vez que um documento é publicado, o sistema gera uma entrada na tabela de históricos.
- **Histórico de Versões**: Permite consultar o estado do documento em datas passadas.
- **Visualização de Versões**: Na Wiki, o usuário pode utilizar o seletor de versões para ler conteúdos antigos.
- **Autor da Publicação**: O sistema registra quem foi o usuário responsável por cada publicação.

## Wiki (Visualização)

A Wiki é a interface de consumo dos documentos publicados.
- **Contexto de Projeto**: A navegação lateral da Wiki é carregada com base no Projeto selecionado.
- **Renderização**: O conteúdo Markdown é renderizado em HTML com suporte a:
    - Tabelas
    - Blocos de Código (com sintaxe highlighting)
    - Diagramas Mermaid (Fluxogramas, Gantt, etc.)
    - Estilo Premium (Tipografia otimizada e modo escuro)

## Regras de Publicação

- Um documento só pode ser publicado se possuir conteúdo.
- A publicação de uma nova versão não apaga o histórico das anteriores.
- Somente usuários com permissão de `update` no módulo de documentos podem realizar publicações.
