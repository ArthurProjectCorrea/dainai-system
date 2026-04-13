# Database Seed - Auth + Admin

## Objetivo

Definir estrategia de carga inicial de dados para ambiente local/homologacao, alinhada aos modulos de autenticacao e administracao.

## Arquivo de Referencia

- Seed exemplo: `docs/api-teste/database_seed.json`

## Ordem Recomendada de Seed

1. `screens`
2. `permissions`
3. `departments`
4. `positions`
5. `accesses`
6. `teams`
7. `AspNetUsers` (usuarios tecnicos/admin iniciais)
8. `profiles`
9. `profile_team`

Essa ordem evita violacao de chave estrangeira e garante consistencia RBAC.

## Regras Obrigatorias

- `permissions` e `screens` sao catalogos controlados. Mudancas somente por migration/seed versionado.
- Nunca incluir senha em texto puro em arquivos de seed.
- Quando houver usuario inicial, usar hash do ASP.NET Identity gerado fora do repositiorio.
- Para onboarding de novos usuarios, usar fluxo de convite com token temporario (nao enviar senha por e-mail).

## Exemplo de Cenarios

### Ambiente local

- Pode incluir 1 usuario admin inicial com hash placeholder seguro para desenvolvimento.
- Ajustar permissao para permitir bootstrap do sistema.

### Homologacao/producao

- Evitar usuario admin fixo no seed permanente.
- Criar usuario inicial por pipeline segura de bootstrap.
- Rotacionar credenciais e registrar auditoria da inicializacao.

## Idempotencia

Para cada carga:

- Usar `upsert` por chave natural (ex.: `name_key` em screens/permissions).
- Nao duplicar registros de relacao (`accesses`, `profile_team`).
- Versionar seed (`seed_version`) e registrar aplicacao em tabela de controle.

## Validacoes Pos-Seed

- Existe ao menos um perfil com permissao de administracao.
- Todas as `screens` possuem pelo menos permissao `view` para cargos esperados.
- Nao ha duplicidade em (`position_id`, `screen_id`, `permission_id`) na `accesses`.
- Nao ha duplicidade em (`profile_id`, `team_id`, `position_id`) na `profile_team`.

## Auditoria e Observabilidade

- Registrar evento de seed com:
  - versao aplicada
  - ambiente
  - operador/pipeline
  - timestamp
  - correlationId
