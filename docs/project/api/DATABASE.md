# Banco de Dados

## 🗄️ Visão Geral

A API utiliza **PostgreSQL 16** para persistência de dados, gerenciado via **Entity Framework Core 10** com migrações automáticas.

Para consultar schema detalhado e seed, veja:

- [database-schema.md](database-schema.md) - Definição completa das tabelas
- [database-seed.md](database-seed.md) - Estratégia de preenchimento inicial

---

## 📊 Contexto de Banco de Dados

### AppDbContext

```csharp
public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    // === DOMÍNIO ===
    public DbSet<Profile> Profiles { get; set; } = null!;
    public DbSet<Team> Teams { get; set; } = null!;
    public DbSet<ProfileTeam> ProfileTeams { get; set; } = null!;
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<Position> Positions { get; set; } = null!;
    public DbSet<Screen> Screens { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<Access> Accesses { get; set; } = null!;
    public DbSet<OtpAttempt> OtpAttempts { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // === Relacionamentos ===

        // User → Profile (1:1)
        builder.Entity<Profile>()
            .HasOne(p => p.User)
            .WithOne(u => u.Profile)
            .HasForeignKey<Profile>(p => p.UserId);

        // Position → Access (1:N) com cascade delete
        builder.Entity<Access>()
            .HasOne(a => a.Position)
            .WithMany(p => p.Accesses)
            .HasForeignKey(a => a.PositionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Access>()
            .HasOne(a => a.Screen)
            .WithMany(s => s.Accesses)
            .HasForeignKey(a => a.ScreenId);

        builder.Entity<Access>()
            .HasOne(a => a.Permission)
            .WithMany(p => p.Accesses)
            .HasForeignKey(a => a.PermissionId);

        // Screen → NameKey (Unique)
        builder.Entity<Screen>()
            .HasIndex(s => s.NameKey)
            .IsUnique();
    }
}
```

---

## 🔄 Migrações

### Estrutura

As migrações são versionadas em `Api.Infrastructure/Migrations/`:

```
250115_Initial.cs          # Initial schema creation
250115_Initial.Designer.cs # Metadata (auto-gerado)
```

### Arquivo de Migração Exemplo

```csharp
namespace Api.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250115000001_Initial")]
    partial class Initial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "10.0.0")
                        .HasAnnotation("Relational:MaxIdentifierLength", 63);

            // ... schema definition
        }
    }
}
```

### Registro de Migrações

A tabela `__EFMigrationsHistory` rastreia todas as migrações aplicadas:

```sql
SELECT * FROM "__EFMigrationsHistory";

-- Result:
-- MigrationId                | ProductVersion
-- 20250115000001_Initial     | 10.0.0
```

---

## 🌱 Seed (DbInitializer)

O arquivo `DbInitializer.cs` popula dados iniciais automaticamente se `SeedDatabase=true`.

```csharp
public class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, UserManager<User> userManager)
    {
        // Pula seed se já existe dados
        if (await context.Databases.CanConnectAsync())
        {
            var existingScreens = await context.Screens.AnyAsync();
            if (existingScreens)
                return;
        }

        // 1. Cria Departments
        var departments = new List<Department>
        {
            new Department { Id = 1, Name = "TI" },
            new Department { Id = 2, Name = "Operações" }
        };
        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();

        // 2. Cria Screens
        var screens = new List<Screen>
        {
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
        };
        context.Screens.AddRange(screens);
        await context.SaveChangesAsync();

        // 3. Cria Permissions
        var permissions = new List<Permission>
        {
            new Permission { Id = 1, Name = "Visualizar", NameKey = "view" },
            new Permission { Id = 2, Name = "Criar", NameKey = "create" },
            new Permission { Id = 3, Name = "Atualizar", NameKey = "update" },
            new Permission { Id = 4, Name = "Deletar", NameKey = "delete" }
        };
        context.Permissions.AddRange(permissions);
        await context.SaveChangesAsync();

        // 4. Cria Positions
        var positions = new List<Position>
        {
            new Position { Id = 1, Name = "Administrador", DepartmentId = 1, IsActive = true },
            new Position { Id = 2, Name = "Supervisor", DepartmentId = 1, IsActive = true }
        };
        context.Positions.AddRange(positions);
        await context.SaveChangesAsync();

        // 5. Cria Accesses (RBAC Matrix)
        var adminAccesses = new List<Access>
        {
            // Administrador tem acesso total
            new Access { PositionId = 1, ScreenId = 1, PermissionId = 1 },  // users_management:view
            new Access { PositionId = 1, ScreenId = 1, PermissionId = 2 },  // users_management:create
            new Access { PositionId = 1, ScreenId = 1, PermissionId = 4 },  // users_management:delete
            new Access { PositionId = 1, ScreenId = 2, PermissionId = 1 },  // teams_management:view
            new Access { PositionId = 1, ScreenId = 2, PermissionId = 2 },  // teams_management:create
            new Access { PositionId = 1, ScreenId = 3, PermissionId = 1 },  // access_control:view
            new Access { PositionId = 1, ScreenId = 3, PermissionId = 2 },  // access_control:create
            new Access { PositionId = 1, ScreenId = 3, PermissionId = 4 },  // access_control:delete
            new Access { PositionId = 1, ScreenId = 4, PermissionId = 1 },  // screens_management:view
            new Access { PositionId = 1, ScreenId = 4, PermissionId = 3 }   // screens_management:update
        };
        context.Accesses.AddRange(adminAccesses);
        await context.SaveChangesAsync();

        // 6. Cria Teams
        var teams = new List<Team>
        {
            new Team { Id = Guid.NewGuid(), Name = "Operações", IsActive = true }
        };
        context.Teams.AddRange(teams);
        await context.SaveChangesAsync();

        // 7. Cria Admin User
        var adminUser = new User
        {
            UserName = "admin@empresa.com",
            Email = "admin@empresa.com",
            EmailConfirmed = true
        };
        await userManager.CreateAsync(adminUser, "Admin123!");

        // 8. Cria Profile
        var adminProfile = new Profile
        {
            Id = Guid.NewGuid(),
            UserId = adminUser.Id,
            Name = "Administrador",
            IsActive = true
        };
        context.Profiles.Add(adminProfile);
        await context.SaveChangesAsync();

        // 9. Vincula Profile ao Team com Posição
        var profileTeam = new ProfileTeam
        {
            ProfileId = adminProfile.Id,
            TeamId = teams[0].Id,
            PositionId = 1  // Admin
        };
        context.ProfileTeams.Add(profileTeam);
        await context.SaveChangesAsync();
    }
}
```

### Ativação do Seed

Em `Program.cs`:

```csharp
var app = builder.Build();

// Executa migrações e seed automaticamente
if (builder.Configuration.GetValue<bool>("SeedDatabase"))
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        // Aplica migrações pendentes
        await context.Database.MigrateAsync();

        // Popula dados iniciais
        await DbInitializer.SeedAsync(context, userManager);
    }
}

app.Run();
```

---

## 🔗 Relacionamentos

### Diagrama ER

```
AspNetUsers (Identity)
    |
    | 1:1 (FK: UserId)
    |
    v
Profile
    |
    | 1:N
    |
    v
ProfileTeam
    |
    +-----> Team (N:1)
    |
    +-----> Position (N:1)
             |
             | 1:N (FK: PositionId, cascade)
             |
             v
             Access
             |
             +-----> Screen (N:1)
             |
             +-----> Permission (N:1)
```

### Queries Comuns

#### Obter permissões de um usuário

```sql
SELECT DISTINCT s.name_key AS screen, p.name_key AS permission
FROM profiles prof
JOIN aspnetusers u ON prof.user_id = u.id
JOIN profile_team pt ON prof.id = pt.profile_id
JOIN positions pos ON pt.position_id = pos.id
JOIN accesses a ON pos.id = a.position_id
JOIN screens s ON a.screen_id = s.id
JOIN permissions p ON a.permission_id = p.id
WHERE prof.id = '550e8400-e29b-41d4-a716-446655440000'
AND prof.is_active = true;
```

#### Obter usuários de um time

```sql
SELECT prof.name, prof.email, pos.name AS position, t.name AS team
FROM profile_team pt
JOIN profiles prof ON pt.profile_id = prof.id
JOIN aspnetusers u ON prof.user_id = u.id
JOIN teams t ON pt.team_id = t.id
JOIN positions pos ON pt.position_id = pos.id
WHERE pt.team_id = '660e8400-e29b-41d4-a716-446655440000'
AND prof.is_active = true;
```

---

## 🔧 Configuração de Conexão

### Variáveis de Ambiente

```env
# PostgreSQL
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=dainaidb;Username=user;Password=password

# Seed automático
SeedDatabase=true

# Redis (opcional)
Redis__ConnectionString=redis:6379
```

### Dockerfile PostgreSQL (docker-compose.yml)

```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-user}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
    POSTGRES_DB: ${POSTGRES_DB:-dainaidb}
  volumes:
    - pgdata:/var/lib/postgresql/data
  ports:
    - '5432:5432'
```

---

## 🧹 Comandos Úteis

### Conectar ao PostgreSQL

```bash
# Dentro do container
docker compose exec db psql -U user -d dainaidb

# Comandos SQL comuns
\dt                    # Listar tabelas
\d Profiles            # Descrever tabela
SELECT * FROM Users;   # Query
```

### Resetar Banco de Dados

```bash
# 1. Parar e remover containers + volumes
docker compose down -v

# 2. Subir novamente (recreia banco e executa seed)
docker compose up -d

# 3. Verificar status
docker compose ps
```

### Verificar Migrações

```bash
# Dentro do container
docker compose exec db psql -U user -d dainaidb -c \
  "SELECT * FROM \"__EFMigrationsHistory\";"
```

### Backup/Restore

```bash
# Backup
docker compose exec db pg_dump -U user -d dainaidb > backup.sql

# Restore
docker compose exec db psql -U user -d dainaidb < backup.sql
```

---

## 📈 Índices

Os índices implementados otimizam consultas comuns:

```sql
-- Screen.NameKey (Unique)
CREATE UNIQUE INDEX ix_screens_name_key ON screens(name_key);

-- Access (composite - cascade delete requer posição)
CREATE INDEX ix_access_position_id ON accesses(position_id);
CREATE INDEX ix_access_screen_id ON accesses(screen_id);
CREATE INDEX ix_access_permission_id ON accesses(permission_id);
```

---

## 🔐 Constraint de Integridade

```sql
-- Profile.UserId é unique (1:1)
ALTER TABLE profiles ADD CONSTRAINT uk_profile_user_id UNIQUE (user_id);

-- Access composite key
ALTER TABLE accesses ADD CONSTRAINT uk_access
  UNIQUE (position_id, screen_id, permission_id);

-- ProfileTeam composite key
ALTER TABLE profile_teams ADD CONSTRAINT uk_profile_team
  UNIQUE (profile_id, team_id, position_id);
```

---

## 📊 Estatísticas

Para monitorar crescimento do banco:

```bash
# Tamanho total do banco
docker compose exec db psql -U user -d dainaidb -c \
  "SELECT sum(pg_total_relation_size(schemaname||'.'||tablename))::text
   FROM pg_tables WHERE schemaname = 'public';"

# Tamanho por tabela
docker compose exec db psql -U user -d dainaidb -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size DESC;"
```

---

## 🔗 Documentação Relacionada

- [database-schema.md](database-schema.md) - Schema completo e convencioões
- [database-seed.md](database-seed.md) - Estratégia de seed e idempotência
- [MODELS.md](MODELS.md) - Definição de entidades
- [DEPLOYMENT.md](DEPLOYMENT.md) - Infraestrutura e containers

---

**Próximos passos?** 👉 Leia [TESTING.md](TESTING.md) para estratégia de testes.
