# Web - Dainai System

Aplicacao frontend em Next.js (App Router) responsavel por autenticacao, navegacao privada e renderizacao da interface orientada por permissao.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9

## Objetivos

- Consumir API C# via prefixo `/api` no proprio dominio do web.
- Controlar sessao com cookie HTTP-only emitido pelo backend.
- Aplicar RBAC por time ativo no cliente com suporte ao header `X-Active-Team-Id`.

## Estrutura Principal

- `apps/web/app`: rotas e layouts (publico/privado)
- `apps/web/components`: componentes de UI e dominio
- `apps/web/components/providers/auth-provider.tsx`: estado de autenticacao e RBAC no cliente
- `apps/web/app/auth/actions.ts`: server actions de auth
- `apps/web/proxy.ts`: protecao de rotas e proxy para API
- `apps/web/types/auth.ts`: contratos da resposta `/api/v1/auth/me`

## Guia Rapido

1. Leia [ARCHITECTURE.md](ARCHITECTURE.md)
2. Entenda sessao em [AUTHENTICATION.md](AUTHENTICATION.md)
3. Entenda permissoes em [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md)
4. Consulte [ROUTES.md](ROUTES.md)
5. Consulte [CHANGELOG-2026-04-14.md](CHANGELOG-2026-04-14.md) para as ultimas mudancas

## Comandos

No diretorio `apps/web`:

```bash
npm run dev
npm run build
npm run lint
npm run start
```
