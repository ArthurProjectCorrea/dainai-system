# 🧪 Testes e Validacao (Web)

## Validacoes Minimas

1. Lint:

```bash
cd apps/web
npm run lint
```

2. Build:

```bash
cd apps/web
npm run build
```

## Cenarios Funcionais Prioritarios

1. Login valido redireciona para `/dashboard`.
2. Login invalido exibe erro amigavel.
3. Usuario nao autenticado nao acessa rota privada.
4. Fluxo forgot -> verify OTP -> reset finaliza com sucesso.
5. Troca de time altera opcoes de menu conforme permissao.
6. Logout remove sessao e volta para `/auth/login`.

## Sinais de Regressao Comuns

- `/api/v1/auth/me` retornando 401 logo apos login.
- Menu exibindo itens sem permissao.
- Troca de time sem impacto no acesso.
- Redirecionamentos em loop entre `/auth/login` e `/dashboard`.
