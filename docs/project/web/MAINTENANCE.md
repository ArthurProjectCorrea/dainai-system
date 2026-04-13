# 🛠️ Manutencao da Aplicacao Web

## Rotina Recomendada

1. Atualizar dependencias de forma controlada.
2. Rodar `npm run lint` e `npm run build` a cada alteracao relevante.
3. Revisar `proxy.ts` ao alterar regras de autenticacao/rotas.
4. Revisar `types/auth.ts` quando contrato da API mudar.
5. Validar permissao por time ao alterar sidebar e regras de menu.

## Checklist de Mudancas de Auth/RBAC

- Contrato `/api/v1/auth/me` atualizado no frontend?
- Normalizacao de campos camelCase/PascalCase preservada?
- Header `X-Active-Team-Id` continua sendo enviado?
- Fluxo de logout invalida sessao local e backend?

## Problemas Frequentes

- Loop de redirecionamento: cookie ausente ou invalido.
- Menu vazio: `teamAccesses` sem dados para o time ativo.
- 401 em `/api/v1/auth/me`: sessao expirada ou CORS/cookie mal configurado.
