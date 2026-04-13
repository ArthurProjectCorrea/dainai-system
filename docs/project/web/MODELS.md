# 🧾 Modelos de Dados (Web)

Modelos definidos em `apps/web/types/auth.ts`.

## Principais Interfaces

```ts
export interface UserProfile {
  id: string
  name: string
  avatarUrl: string | null
  email: string
  isActive: boolean
}

export interface UserAccess {
  nameKey: string
  nameSidebar: string
  permissions: string[]
}

export interface UserTeam {
  id: string
  name: string
  logotipoUrl?: string | null
}

export interface TeamAccess {
  teamId: string
  position: string
  department: string
  accesses: UserAccess[]
}

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

## Modelo de Uso no Cliente

`AuthProvider` converte `UserMeResponse` para `User` agregado:

- dados de perfil
- lista de times
- permissoes do time ativo
