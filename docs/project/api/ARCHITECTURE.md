# Arquitetura da API

## 🏗️ Visão Geral em Camadas

A DAINAI API segue uma arquitetura em **4 camadas** para manter separação de responsabilidades e facilitar testes:

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (Web)                                   │
│  - Controllers (AuthController, AdminController)            │
│  - Attributes ([HasPermission], [Authorize])               │
│  - Program.cs (configuração e middleware)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│  Application Layer (Contrato)                               │
│  - Interfaces (IAuthService, IAdminService)                │
│  - DTOs (LoginRequest, LoginResponse, AdminDtos)           │
│  - Utils (extensões, helpers)                               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│  Infrastructure Layer (Implementação)                       │
│  - Services (AuthService, AdminService, EmailService)      │
│  - AppDbContext (EF Core)                                   │
│  - DbInitializer (seed e migrações)                         │
│  - Migrations (versionamento de schema)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│  Domain Layer (Entidades)                                   │
│  - User (ASP.NET Identity)                                  │
│  - Profile, Team, Position, Screen, Permission             │
│  - Access, OtpAttempt, ProfileTeam                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Diretórios

```
apps/api/
├── Api.Web/                          # Camada de Apresentação
│   ├── Controllers/
│   │   ├── AuthController.cs        # Autenticação
│   │   ├── AdminController.cs       # Administração
│   │   └── WeatherForecastController.cs
│   ├── Attributes/
│   │   └── HasPermissionAttribute.cs # Validação de permissões
│   ├── Properties/
│   │   └── launchSettings.json      # Portas e perfis de launch
│   ├── Program.cs                  # Configuração de startup
│   ├── appsettings.json           # Configuração padrão
│   ├── appsettings.Development.json# Configuração dev
│   └── Api.Web.csproj             # Projeto .NET
│
├── Api.Application/                 # Contrato e DTOs
│   ├── DTOs/
│   │   ├── AuthDtos.cs            # Modelos de autenticação
│   │   └── AdminDtos.cs           # Modelos administrativos
│   ├── Interfaces/
│   │   ├── IAuthService.cs        # Contrato de auth
│   │   ├── IAdminService.cs       # Contrato de admin
│   │   ├── ICacheService.cs       # Contrato de cache
│   │   └── IEmailService.cs       # Contrato de email
│   ├── Utils/
│   └── Api.Application.csproj
│
├── Api.Infrastructure/              # Implementação de Serviços
│   ├── Services/
│   │   ├── AuthService.cs         # Lógica de autenticação
│   │   ├── AdminService.cs        # Lógica administrativa
│   │   ├── CacheService.cs        # Wrapper Redis
│   │   └── EmailService.cs        # Envio de emails SMTP
│   ├── AppDbContext.cs            # EF Core DbContext
│   ├── DbInitializer.cs           # Seed e setup inicial
│   ├── Migrations/
│   │   ├── 20240101_Initial.cs
│   │   └── __EFMigrationsHistory  # Registro de migrações
│   └── Api.Infrastructure.csproj
│
├── Api.Domain/                      # Entidades de Negócio
│   ├── User.cs                    # Estende IdentityUser
│   ├── Profile.cs                 # Dados do usuário
│   ├── Team.cs                    # Time/departamento
│   ├── Position.cs                # Cargo/posição
│   ├── Screen.cs                  # Tela/módulo
│   ├── Permission.cs              # Ação (view, create...)
│   ├── Access.cs                  # Posição + Tela + Permissão
│   ├── ProfileTeam.cs             # Vinculação usuário-time
│   ├── OtpAttempt.cs              # Controle de brute force
│   └── Api.Domain.csproj
│
├── Api.Tests/                       # Testes Automáticos
│   ├── AuthControllerTests.cs     # Testes unitários
│   ├── RealIntegrationTests.cs    # Testes E2E (Docker)
│   ├── TestWebApplicationFactory.cs # Setup para testes
│   └── Api.Tests.csproj
│
├── Api.sln                          # Solution do projeto
├── Api.slnx                         # Solution Explorer (.NET 10)
├── Dockerfile                       # Build da imagem Docker
├── docker-compose.yml              # Orquestração local
├── .env                            # Variáveis de ambiente (não versionado)
├── .env.example                    # Template de .env
├── .dockerignore                   # Otimização de build
└── package.json                    # Scripts npm para o workspace

```

---

## 🔄 Fluxo de Requisição

### Exemplo: `POST /api/v1/auth/login`

```
┌──────────────────────────────────────────────────────────┐
│ 1. HTTP Request chega no Kestrel                         │
│    POST /api/v1/auth/login                              │
│    Content-Type: application/json                        │
│    { "email": "admin@empresa.com", "password": "..." }  │
└──────────────────────────────────────┬───────────────────┘
                                       │
┌──────────────────────────────────────┴───────────────────┐
│ 2. Routing resolve para AuthController.Login()           │
│    [AllowAnonymous] permite acesso sem autenticação     │
└──────────────────────────────────────┬───────────────────┘
                                       │
┌──────────────────────────────────────┴───────────────────┐
│ 3. Model Binding deserializa LoginRequest                │
│    _authService.LoginAsync(request) é chamado           │
└──────────────────────────────────────┬───────────────────┘
                                       │
┌──────────────────────────────────────┴───────────────────┐
│ 4. AuthService.LoginAsync():                            │
│    ├─ UserManager.FindByEmailAsync()                    │
│    ├─ Valida se Profile.IsActive                        │
│    ├─ SignInManager.PasswordSignInAsync()               │
│    └─ Cria sessão de cookie se sucesso                  │
└──────────────────────────────────────┬───────────────────┘
                                       │
┌──────────────────────────────────────┴───────────────────┐
│ 5. ApiResponse<LoginResponse> é construída              │
│    { Code: "200", Message: "...", Data: {...} }         │
└──────────────────────────────────────┬───────────────────┘
                                       │
┌──────────────────────────────────────┴───────────────────┐
│ 6. Controller retorna Ok(response)                       │
│    ├─ Status 200                                        │
│    ├─ Set-Cookie (auth session)                         │
│    └─ Body JSON com LoginResponse                       │
└──────────────────────────────────────┬───────────────────┘
                                       │
└──────────────────────────────────────┴───────────────────┘
     Resposta chega no cliente
```

---

## 🔗 Integração de Camadas

### Web Layer → Application Layer

```csharp
// Controller injeta serviço via constructor
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;  // Interface do Application

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }
}
```

### Application Layer (DTOs)

```csharp
// Application/DTOs/AuthDtos.cs
public record LoginRequest(string Email, string Password);
public record LoginResponse(Guid UserId, string Email, string Name);
public record ApiResponse<T>(string Code, string Message, T? Data);
```

### Application Layer (Interfaces)

```csharp
// Application/Interfaces/IAuthService.cs
public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UserMeResponse>> GetMeAsync(Guid userId);
    Task LogoutAsync();
    // ... outros métodos
}
```

### Infrastructure Layer (Implementação)

```csharp
// Infrastructure/Services/AuthService.cs
public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ICacheService _cache;
    private readonly IEmailService _emailService;

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return new ApiResponse<LoginResponse>("401", "Credenciais inválidas", null);

        var result = await _signInManager.PasswordSignInAsync(user, request.Password, false, false);
        if (!result.Succeeded)
            return new ApiResponse<LoginResponse>("401", "Credenciais inválidas", null);

        return new ApiResponse<LoginResponse>("200", "Login realizado com sucesso",
            new LoginResponse(user.Id, user.Email!, profile?.Name ?? "Usuário"));
    }
}
```

### Domain Layer (Entidades)

```csharp
// Domain/User.cs
public class User : IdentityUser<Guid>
{
    public Profile? Profile { get; set; }  // Navegação 1:1
}

// Domain/Profile.cs
public class Profile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; }

    // Navegações
    public User User { get; set; } = null!;
    public ICollection<ProfileTeam> ProfileTeams { get; set; } = new List<ProfileTeam>();
}
```

---

## 🛠️ Injeção de Dependência (Program.cs)

```csharp
// Configuração de DI no Program.cs

// 1. Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Identity
builder.Services.AddIdentity<User, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// 3. Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options => {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = ...;
        options.Cookie.SameSite = SameSiteMode.Strict;
    });

// 4. Authorization
builder.Services.AddAuthorization();

// 5. Services (Application/Infrastructure)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICacheService, CacheService>();

// 6. Cache
builder.Services.AddStackExchangeRedisCache(options => ...);

// 7. Swagger
builder.Services.AddSwaggerGen(options => {
    options.AddSecurityDefinition("cookieAuth", ...);
});
```

---

## 🧪 Padrão de Resposta

Todas as APIs retornam um objeto padronizado:

```csharp
public record ApiResponse<T>(
    string Code,      // "200", "400", "401", "404", etc.
    string Message,   // Mensagem legível (em PT-BR)
    T? Data          // Payload real (null em erros)
);
```

### Exemplo de Resposta Sucesso

```json
{
  "code": "200",
  "message": "Login realizado com sucesso",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@empresa.com",
    "name": "Administrador"
  }
}
```

### Exemplo de Resposta Erro

```json
{
  "code": "401",
  "message": "Credenciais inválidas",
  "data": null
}
```

---

## 🔐 Validação de Permissões

### Atributo HasPermission

```csharp
[AttributeUsage(AttributeTargets.Method)]
public class HasPermissionAttribute : Attribute
{
    public string Resource { get; set; }
    public string Action { get; set; }

    public HasPermissionAttribute(string resource, string action)
    {
        Resource = resource;
        Action = action;
    }
}
```

### Uso em Controllers

```csharp
[HttpGet("profiles")]
[HasPermission("users_management", "view")]
public async Task<IActionResult> GetProfiles()
{
    // Só existe user logado
    // E tem permissão "users_management:view"
}
```

### Middleware de Validação

O middleware verifica:

1. Usuário está autenticado? (`[Authorize]`)
2. User.FindFirstValue(ClaimTypes.NameIdentifier) existe?
3. Carrega permissões do cache (RBAC)
4. Valida se tem `resource:action` solicitado

---

## 📊 Diagrama de Fluxo Completo

```
Request HTTP
    ↓
Middleware de Autenticação
    ↓ (Cookie válido?)
Claims criadas (UserId, etc)
    ↓
Routing resolve Controller + Action
    ↓
Attributes validam:
├─ [AllowAnonymous]? (skip auth)
├─ [Authorize]? (requer user)
├─ [HasPermission]? (requer permission)
    ↓
Model Binding (deserializa JSON/Form)
    ↓
Action Method (Controller)
    ↓
Injeta IService (DI resolve)
    ↓
Service executa lógica de negócio
├─ Consulta/modifica banco (EF Core)
├─ Interage com cache (Redis)
├─ Envia email (SMTP)
    ↓
Retorna ApiResponse<T>
    ↓
JSON Serialization
    ↓
HTTP Response (200/400/401/etc)
    ↓
Cliente recebe JSON
```

---

## 🛡️ Padrões de Qualidade e Segurança (Abril 2026)

### Tipagem Estrita e Null Safety

- **Nullability**: O projeto agora utiliza verificação de nulidade estrita em todas as camadas, resolvendo avisos de `CS8604` e `CS8602`. Isso garante que referências nulas sejam tratadas preventivamente antes de atingir o runtime.
- **Async/Await**: Padronização de padrões assíncronos em todos os serviços e repositórios para garantir escalabilidade sob carga.

### Estabilização de Build

- **CI/CD Readiness**: O build da solução (`dotnet build`) foi estabilizado para 0 erros e 0 warnings significativos, garantindo que o projeto esteja pronto para pipelines de integração contínua.
- **Auditoria Automática**: O `AppDbContext` foi estendido para injetar automaticamente IDs de correlação e rastreamento em todas as transações, facilitando debugging e rastreabilidade (observabilidade).

---

## 📝 Última Atualização

- **Data**: Abril 2026
- **Versão**: v1.1
- **Foco**: Estabilidade, Null Safety e Gestão de Arquivos.

---

**Próximos passos?** 👉 Leia [ENDPOINTS.md](ENDPOINTS.md) para referência completa de APIs.
