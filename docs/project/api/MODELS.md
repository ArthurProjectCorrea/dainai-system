# Modelos e DTOs

## 📋 Estrutura de Dados

### Domain Layer (Entidades)

as entidades representam dados persistidos no banco de dados.

---

## 👤 Entidade: User (ASP.NET Identity)

Estende `IdentityUser<Guid>` do framework ASP.NET Core.

```csharp
public class User : IdentityUser<Guid>
{
    // Herança do IdentityUser<Guid>:
    // - Id (Guid)
    // - UserName (string)
    // - Email (string)
    // - EmailConfirmed (bool)
    // - PasswordHash (string)
    // - PhoneNumber (string)
    // - PhoneNumberConfirmed (bool)
    // - TwoFactorEnabled (bool)
    // - LockoutEnd (DateTimeOffset?)
    // - LockoutEnabled (bool)
    // - AccessFailedCount (int)

    // Navegação
    public Profile? Profile { get; set; }  // 1:1 com Profile
}
```

**Responsabilidade**:

- Autenticação
- Gestão de senha (hash, reset)
- Lockout por tentativas falhas

---

## 👥 Entidade: Profile

Dados pessoais do usuário vinculados a um User.

```csharp
public class Profile
{
    public Guid Id { get; set; }                    // UUID primária
    public Guid UserId { get; set; }                // FK → User.Id (unique)
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }          // URL da foto (opcional)
    public bool IsActive { get; set; } = true;      // Soft delete flag

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public User User { get; set; } = null!;         // 1:1 com User
    public ICollection<ProfileTeam> ProfileTeams { get; set; } =
        new List<ProfileTeam>();                    // N:N com Teams/Positions
}
```

**Regras**:

- `UserId` é único (1:1 com User)
- `IsActive = false` desativa sesssão do usuário
- Mudança em `IsActive` invalida cache RBAC

**Exemplo**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "660e8400-e29b-41d4-a716-446655440000",
  "name": "João da Silva",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 👨‍💼 Entidade: Position (Cargo)

Define cargo/posição no sistema com permissões associadas.

```csharp
public class Position
{
    public int Id { get; set; }                     // INT primária
    public int DepartmentId { get; set; }            // FK → Department.Id
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public Department Department { get; set; } = null!;
    public ICollection<Access> Accesses { get; set; } =
        new List<Access>();                        // N:1 com Accesses
    public ICollection<ProfileTeam> ProfileTeams { get; set; } =
        new List<ProfileTeam>();                    // N:1 com ProfileTeams
}
```

**Padrão de Seed**:

```csharp
var positions = new List<Position>
{
    new Position { Id = 1, Name = "Administrador", DepartmentId = 1, IsActive = true },
    new Position { Id = 2, Name = "Supervisor", DepartmentId = 1, IsActive = true },
    new Position { Id = 3, Name = "Analista", DepartmentId = 2, IsActive = true }
};
```

---

## 🏢 Entidade: Department (Departamento)

Agrupa posições por departamento.

```csharp
public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // Ex: "TI", "Operações"

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public ICollection<Position> Positions { get; set; } =
        new List<Position>();
}
```

---

## ⚙️ Entidade: Screen (Tela/Módulo)

Representa módulo/tela da aplicação.

```csharp
public class Screen
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;          // Ex: "Gerenciamento de Usuários"
    public string NameSidebar { get; set; } = string.Empty;   // Ex: "Usuários" (menu)
    public string NameKey { get; set; } = string.Empty;       // Ex: "users_management" (identificador)

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public ICollection<Access> Accesses { get; set; } =
        new List<Access>();
}
```

**Padrão de Seed**:

```csharp
new Screen
{
    Id = 1,
    Name = "Gerenciamento de Usuários",
    NameSidebar = "Usuários",
    NameKey = "users_management"
},
new Screen
{
    Id = 2,
    Name = "Gerenciamento de Teams",
    NameSidebar = "Times",
    NameKey = "teams_management"
},
new Screen
{
    Id = 3,
    Name = "Controle de Acesso",
    NameSidebar = "Acessos",
    NameKey = "access_control"
},
new Screen
{
    Id = 4,
    Name = "Gerenciamento de Telas",
    NameSidebar = "Telas",
    NameKey = "screens_management"
}
```

**Constraints**:

- `NameKey` é **único** e **imutável**
- Não pode ser criada/deletada por API (apenas seed/migration)

---

## 🔑 Entidade: Permission (Permissão)

Ações disponíveis no sistema.

```csharp
public class Permission
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;    // Ex: "Visualizar"
    public string NameKey { get; set; } = string.Empty; // Ex: "view"

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public ICollection<Access> Accesses { get; set; } =
        new List<Access>();
}
```

**Padrão de Seed** (Imutável):

```csharp
var permissions = new List<Permission>
{
    new Permission { Id = 1, Name = "Visualizar", NameKey = "view" },
    new Permission { Id = 2, Name = "Criar", NameKey = "create" },
    new Permission { Id = 3, Name = "Atualizar", NameKey = "update" },
    new Permission { Id = 4, Name = "Deletar", NameKey = "delete" }
};
```

---

## 🔐 Entidade: Access (Acesso/Permissão)

Vinculação entre Position, Screen e Permission formando matriz RBAC.

```csharp
public class Access
{
    public long Id { get; set; }
    public int PositionId { get; set; }      // FK → Position.Id (cascade delete)
    public int ScreenId { get; set; }        // FK → Screen.Id
    public int PermissionId { get; set; }    // FK → Permission.Id

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public Position Position { get; set; } = null!;
    public Screen Screen { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
```

**Constraint**:

- `(position_id, screen_id, permission_id)` é **única** (sem duplicatas)
- Position delete → cascata delete todas as Access associadas

**Exemplo de Rows**:

```
Position=1 (Admin) | Screen=1 (users) | Permission=1 (view)
Position=1 (Admin) | Screen=1 (users) | Permission=2 (create)
Position=1 (Admin) | Screen=1 (users) | Permission=4 (delete)
Position=2 (Supervisor) | Screen=1 (users) | Permission=1 (view)
Position=2 (Supervisor) | Screen=4 (screens) | Permission=1 (view)
```

---

## 👨‍💼 Entidade: Team (Time)

Grupo de trabalho que agrupa usuários.

```csharp
public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;      // Ex: "Operações"
    public string? LogotipoUrl { get; set; }               // URL da logo (opcional)
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public ICollection<ProfileTeam> ProfileTeams { get; set; } =
        new List<ProfileTeam>();
}
```

**Exemplo**:

```json
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Operações",
  "logotipoUrl": "https://cdn.example.com/ops-logo.png",
  "isActive": true
}
```

---

## 🏗️ BaseEntity

Todas as entidades herdam propriedades comuns de auditoria.

```csharp
public abstract class BaseEntity<TId>
{
    public TId Id { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }        // Soft Delete
}
```

## 🔗 Entidade: ProfileTeam (Vinculação)

Associação entre Profile, Team e Position (N:N:N).

```csharp
public class ProfileTeam
{
    public long Id { get; set; }
    public Guid ProfileId { get; set; }      // FK → Profile.Id
    public Guid TeamId { get; set; }         // FK → Team.Id
    public int PositionId { get; set; }      // FK → Position.Id

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public Profile Profile { get; set; } = null!;
    public Team Team { get; set; } = null!;
    public Position Position { get; set; } = null!;
}
```

**Constraint**:

- `(profile_id, team_id, position_id)` é **única**

**Significado**:

- Um Profile pode estar em múltiplos Teams
- Em cada Team, pode ter uma Position diferente
- Agregação de permissões baseada em todas as ProfileTeams

**Exemplo**:

```
Profile: João da Silva
├─ Team: Operações, Position: Gerente
├─ Team: TI, Position: Amministrador
└─ Team: Desenvolvimento, Position: Supervisor
```

---

## ⏱️ Entidade: OtpAttempt

Controle de brute force para fluxos sensíveis.

```csharp
public class OtpAttempt
{
    public long Id { get; set; }
    public Guid UserId { get; set; }             // FK → User.Id
    public string Purpose { get; set; } = string.Empty;  // Ex: "forgot_password"
    public int AttemptCount { get; set; } = 0;
    public DateTime WindowStartedAt { get; set; }
    public DateTime? BlockedUntil { get; set; }  // Null se não bloqueado

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegações
    public User User { get; set; } = null!;
}
```

**Lógica de Rate Limit**:

```
1. Tentativa realizada
2. Incrementa AttemptCount
3. Se AttemptCount >= 5:
   - BlockedUntil = now + 1 hora
   - Rejeita requisição (429)
4. Se (now - WindowStartedAt) > 1 hora:
   - Reset para novo ciclo
   - AttemptCount = 0
```

---

## 📦 Application Layer (DTOs)

DTOs são objetos de transferência de dados para APIs.

---

## 🔐 Auth DTOs

```csharp
// Request
public record LoginRequest(string Email, string Password);

// Response
public record LoginResponse(Guid UserId, string Email, string Name);

// Request
public record ForgotPasswordRequest(string Email);

// Request
public record VerifyOtpRequest(string Email, string Code);

// Response
public record VerifyOtpResponse(string ResetToken, int ExpiresInMinutes);

// Request
public record ResetPasswordRequest(string NewPassword, string ConfirmPassword);

// Componentes de resposta /me
public record ProfileResponse(
    Guid Id,
    string Name,
    string? AvatarUrl,
    string Email,
    bool IsActive
);

public record PermissionDto(int Id, string Name, string NameKey);

public record ScreenDto(int Id, string Name, string NameSidebar, string NameKey);

public record AccessDto(string NameKey, string NameSidebar, List<string> Permissions);

public record UserTeamDto(
    Guid Id, 
    string Name, 
    string? LogotipoUrl,
    [property: JsonPropertyName("isActive")] bool IsActive
);

public record TeamAccessDto(
    Guid TeamId,
    string Position,
    string Department,
    List<AccessDto> Accesses
);

public record UserMeResponse(
    ProfileResponse Profile,
    List<UserTeamDto> Teams,
    List<TeamAccessDto> TeamAccesses
);

// Resposta genérica
public record ApiResponse<T>(string Code, string Message, T? Data);
```

**Exemplo de UserMeResponse**:

```json
{
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Administrador",
    "avatarUrl": null,
    "email": "admin@empresa.com",
    "isActive": true
  },
  "teams": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Operações",
      "logotipoUrl": null,
      "isActive": true
    }
  ],
  "teamAccesses": [
    {
      "teamId": "660e8400-e29b-41d4-a716-446655440000",
      "position": "Gerente",
      "department": "TI",
      "accesses": [
        {
          "nameKey": "users_management",
          "nameSidebar": "Usuários",
          "permissions": ["view", "create", "delete"]
        }
      ]
    }
  ]
}
```

---

## 👥 Admin DTOs

```csharp
public record CreateProfileRequest(
    string Name,
    string Email,
    Guid TeamId,
    int PositionId
);

public record PositionResponse(
    int Id,
    string Name,
    int DepartmentId,
    bool IsActive,
    List<int> ScreenPermissions
);

public record TeamResponse(
    Guid Id,
    string Name,
    string? LogotipoUrl,
    bool IsActive
);

public record ScreenResponse(
    int Id,
    string Name,
    string NameSidebar,
    string NameKey
);

public record AccessControlResponse(
    List<PositionResponse> Data,
    List<DepartmentDto> Departments,
    List<PermissionDto> Permissions,
    List<ScreenDto> Screens
);

public record DepartmentDto(int Id, string Name);
```

---

## 📊 Relacionamentos Críticos

```
User (1) ←→ (1) Profile
           ↓
        ProfileTeam (*)
           ↓
    ┌─────┴─────┐
    (*)         (*)
    Team        Position
    ↓           ↓
  (*)        (N) Access
    ↓           ↓
    (N) Access ←┘
        ↓
    Screen × Permission
```

---

## 🔗 Documentação Relacionada

- [DATABASE.md](DATABASE.md) - Schema e migrações
- [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md) - Fluxo RBAC
- database-schema.md e database-seed.md (já existentes)

---

**Próximos passos?** 👉 Leia [SERVICES.md](SERVICES.md) para lógica de negócio.
