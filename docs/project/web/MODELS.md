# 🧾 Modelos de Dados (Web)

Modelos definidos em:

- apps/web/types/auth.ts
- apps/web/types/team.ts

## Principais interfaces

```ts
export interface Team {
  id: string
  name: string
  iconUrl: string | null
  logotipoUrl: string | null
  isActive: boolean
}

export interface UserAccess {
  nameKey: string
  name: string
  nameSidebar: string
  permissions: string[]
}

export type TeamAccess = {
  teamId: string
  position: string
  department: string
  accesses: UserAccess[]
}

export type UserTeam = Team
```

## Estrutura de resposta /auth/me usada no cliente

```ts
export interface UserMeResponse {
  code: string
  message: string
  data?: {
    profile: UserProfile
    teams: UserTeam[]
    teamAccesses: TeamAccess[]
  }
}
```

## Modelo de uso no cliente

AuthProvider converte UserMeResponse para User agregado contendo:

- dados de perfil
- lista de times com status ativo/inativo
- permissoes por time
- contexto ativo para hasPermission
