# 🛡️ Autorizacao RBAC (Web)

## Fonte de Permissao

O frontend usa o retorno de `GET /api/v1/auth/me`:

- `teams`: times disponiveis para o usuario
- `teamAccesses`: permissoes por time

Formato relevante:

```json
{
  "data": {
    "teams": [{ "id": "team-1", "name": "Operacoes" }],
    "teamAccesses": [
      {
        "teamId": "team-1",
        "position": "Gerente",
        "department": "TI",
        "accesses": [
          {
            "nameKey": "users_management",
            "nameSidebar": "Usuarios",
            "permissions": ["view", "create", "delete"]
          }
        ]
      }
    ]
  }
}
```

## Time Ativo

Definido em `AuthProvider`:

- estado `activeTeamId`
- persistencia em `localStorage` (`active_team_id`)
- espelhamento em cookie `active_team_id`

## Verificacao de Permissao

Funcoes principais em `AuthProvider`:

- `activePermissionsByScreen`: mapa `screen -> permissions[]`
- `hasPermission(screen, permission)`

Uso na sidebar:

- cada subitem com `is_permission: true` exige permissao `view`.
- menu e filtrado por `name_key`.

## Integracao com Backend

No proxy, em chamadas `/api/*`:

- se houver cookie `active_team_id`, e enviado header `X-Active-Team-Id`.
- backend pode resolver autorizacao no escopo do time selecionado.
