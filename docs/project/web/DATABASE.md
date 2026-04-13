# 🗄️ Banco de Dados (Contexto Web)

O frontend nao acessa o banco diretamente.

## Como o web obtem dados

1. Navegador chama endpoints `/api/*` no dominio Next.
2. `proxy.ts` reescreve para API C#.
3. API consulta PostgreSQL/Redis e devolve resposta ao web.

## Referencias

- Schema e detalhes do banco: `docs/project/api/database-schema.md`
- Seed de dados: `docs/project/api/database-seed.md`

## Persistencia local no frontend

- `localStorage`: apenas `active_team_id`
- cookies: sessao de auth e cookie auxiliar de time ativo
