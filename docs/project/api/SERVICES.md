# Serviços (Services)

## 🏗️ Arquitetura de Serviços

A camada Infrastructure implementa os serviços de negócio. Cada serviço é injetado no container DI e acessado pelos controllers.

```
┌─────────────────────────────────┐
│ Controllers                      │
│ (Request handlers)               │
└───────────┬───────────────────────┘
            │ Injeta Interfaces
┌───────────┴─────────────────────┐
│ IAuthService      IAdminService │
│ IEmailService     ICacheService │
└───────────┬───────────────────────┘
            │ Implementa
┌───────────┴──────────────────────────────────┐
│ AuthService    AdminService                  │
│ EmailService   CacheService                  │
└───────────┬──────────────────────────────────┘
            │ Usa
┌───────────┴──────────────────────────────────┐
│ UserManager<User>   AppDbContext             │
│ SignInManager<User> IConfiguration           │
└──────────────────────────────────────────────┘
```

---

## 🔐 IAuthService

Contrato para operações de autenticação e autorização.

```csharp
public interface IAuthService
{
    /// <summary>
    /// Autentica usuário com email/senha e cria sessão de cookie.
    /// </summary>
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);

    /// <summary>
    /// Retorna dados de perfil, permissões e times do usuário autenticado.
    /// </summary>
    Task<ApiResponse<UserMeResponse>> GetMeAsync(Guid userId);

    /// <summary>
    /// Encerra a sessão do usuário.
    /// </summary>
    Task LogoutAsync();

    /// <summary>
    /// Inicia fluxo de recuperação de senha com OTP.
    /// </summary>
    Task<ApiResponse<object>> ForgotPasswordAsync(string email);

    /// <summary>
    /// Valida OTP e gera reset token.
    /// </summary>
    Task<ApiResponse<VerifyOtpResponse>> VerifyOtpAsync(VerifyOtpRequest request);

    /// <summary>
    /// Reseta senha com token válido.
    /// </summary>
    Task<ApiResponse<object>> ResetPasswordAsync(string resetToken, string newPassword);
}
```

### AuthService (Implementação)

```csharp
public class AuthService : IAuthService
{
    // Dependências injetadas
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly AppDbContext _context;
    private readonly ICacheService _cache;
    private readonly IEmailService _emailService;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        AppDbContext context,
        ICacheService cache,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _cache = cache;
        _emailService = emailService;
    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
    {
        // Ver detalhes em AUTHENTICATION.md
    }

    public async Task<ApiResponse<UserMeResponse>> GetMeAsync(Guid userId)
    {
        // Ver detalhes em AUTHENTICATION.md
        // Carrega RBAC com eager loading e armazena em cache
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
    }

    public async Task<ApiResponse<object>> ForgotPasswordAsync(string email)
    {
        // Ver detalhes em AUTHENTICATION.md
        // Gera OTP e envia por email
    }

    public async Task<ApiResponse<VerifyOtpResponse>> VerifyOtpAsync(
        VerifyOtpRequest request)
    {
        // Ver detalhes em AUTHENTICATION.md
        // Valida OTP e gera reset token
    }

    public async Task<ApiResponse<object>> ResetPasswordAsync(
        string resetToken, string newPassword)
    {
        // Ver detalhes em AUTHENTICATION.md
        // Altera senha e invalida cache RBAC
    }
}
```

---

## 👥 IAdminService

Contrato para gerenciamento administrativo (usuários, times, posições).

```csharp
public interface IAdminService
{
    // === PROFILES / USERS ===
    Task<ApiResponse<List<ProfileResponse>>> GetProfilesAsync();
    Task<ApiResponse<ProfileResponse>> CreateProfileAsync(CreateProfileRequest request);
    Task<ApiResponse<object>> ToggleProfileActiveAsync(Guid profileId);

    // === ACCESS CONTROL ===
    Task<ApiResponse<AccessControlResponse>> GetAccessControlAsync();
    Task<ApiResponse<object>> CreatePositionAsync(SavePositionRequest request);
    Task<ApiResponse<object>> UpdatePositionAsync(int id, SavePositionRequest request);
    Task<ApiResponse<object>> DeletePositionAsync(int positionId);

    // === TEAMS ===
    Task<ApiResponse<List<TeamResponse>>> GetTeamsAsync();
    Task<ApiResponse<object>> CreateTeamAsync(TeamResponse request);

    // === SCREENS ===
    Task<ApiResponse<List<ScreenResponse>>> GetScreensAsync();
    Task<ApiResponse<object>> UpdateScreenAsync(int screenId, ScreenResponse request);
}
```

### AdminService (Implementação)

```csharp
public class AdminService : IAdminService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;
    private readonly ICacheService _cache;

    public AdminService(
        AppDbContext context,
        UserManager<User> userManager,
        IEmailService emailService,
        ICacheService cache)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
        _cache = cache;
    }

    // === PROFILES ===

    public async Task<ApiResponse<List<ProfileResponse>>> GetProfilesAsync()
    {
        var profiles = await _context.Profiles
            .Include(p => p.User)
            .Where(p => p.IsActive)
            .Select(p => new ProfileResponse(
                p.Id, p.Name, p.AvatarUrl, p.User.Email!, p.IsActive
            ))
            .ToListAsync();

        return new ApiResponse<List<ProfileResponse>>(
            "200", "", profiles);
    }

    public async Task<ApiResponse<ProfileResponse>> CreateProfileAsync(
        CreateProfileRequest request)
    {
        // 1. Validação
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return new ApiResponse<ProfileResponse>("400",
                "Email já está em uso", null);

        var team = await _context.Teams.FindAsync(request.TeamId);
        if (team == null)
            return new ApiResponse<ProfileResponse>("400",
                "Time não existe", null);

        var position = await _context.Positions.FindAsync(request.PositionId);
        if (position == null)
            return new ApiResponse<ProfileResponse>("400",
                "Posição não existe", null);

        // 2. Cria usuário
        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = false
        };

        string tempPassword = GenerateTemporaryPassword();
        var result = await _userManager.CreateAsync(user, tempPassword);

        if (!result.Succeeded)
            return new ApiResponse<ProfileResponse>("400",
                string.Join(", ", result.Errors.Select(e => e.Description)), null);

        // 3. Cria profile
        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = request.Name,
            IsActive = true
        };

        _context.Profiles.Add(profile);

        // 4. Vincula a team
        var profileTeam = new ProfileTeam
        {
            ProfileId = profile.Id,
            TeamId = request.TeamId,
            PositionId = request.PositionId
        };

        _context.ProfileTeams.Add(profileTeam);
        await _context.SaveChangesAsync();

        // 5. Envia email de convite
        var inviteLink = $"https://app.example.com/reset-password?email={request.Email}";
        await _emailService.SendInvitationEmailAsync(request.Email, inviteLink);

        return new ApiResponse<ProfileResponse>("201",
            "Perfil criado com sucesso",
            new ProfileResponse(profile.Id, profile.Name, profile.AvatarUrl,
                              profile.User.Email!, profile.IsActive));
    }

    public async Task<ApiResponse<object>> ToggleProfileActiveAsync(Guid profileId)
    {
        var profile = await _context.Profiles.FindAsync(profileId);
        if (profile == null)
            return new ApiResponse<object>("404", "Perfil não encontrado", null);

        profile.IsActive = !profile.IsActive;
        _context.Profiles.Update(profile);
        await _context.SaveChangesAsync();

        // Invalida cache RBAC
        await _cache.DeleteAsync($"rbac_{profile.UserId}");

        return new ApiResponse<object>("200",
            "Perfil atualizado com sucesso",
            new { id = profile.Id, isActive = profile.IsActive });
    }

    // === ACCESS CONTROL ===

    public async Task<ApiResponse<AccessControlResponse>> GetAccessControlAsync()
    {
        var positions = await _context.Positions
            .Include(p => p.Accesses)
            .Select(p => new PositionResponse(
                p.Id, p.Name, p.DepartmentId, p.IsActive,
                p.Accesses.Select(a => a.ScreenId).ToList()
            ))
            .ToListAsync();

        var departments = await _context.Departments
            .Select(d => new DepartmentDto(d.Id, d.Name))
            .ToListAsync();

        var permissions = await _context.Permissions
            .Select(p => new PermissionDto(p.Id, p.Name, p.NameKey))
            .ToListAsync();

        var screens = await _context.Screens
            .Select(s => new ScreenDto(s.Id, s.Name, s.NameSidebar, s.NameKey))
            .ToListAsync();

        return new ApiResponse<AccessControlResponse>("200", "",
            new AccessControlResponse(positions, departments, permissions, screens));
    }

    public async Task<ApiResponse<object>> CreatePositionAsync(SavePositionRequest request)
    {
        // 1. Resolve Departamento (id ou novo nome)
        int departmentId = request.DepartmentId;

        if (departmentId == 0 && !string.IsNullOrWhiteSpace(request.NewDepartmentName))
        {
            var deptName = request.NewDepartmentName.Trim();
            var existingDept = await _context.Departments
                .FirstOrDefaultAsync(d => d.Name.ToLower() == deptName.ToLower());

            if (existingDept != null)
            {
                departmentId = existingDept.Id;
            }
            else
            {
                var newDept = new Department { Name = deptName };
                _context.Departments.Add(newDept);
                await _context.SaveChangesAsync();
                departmentId = newDept.Id;
            }
        }

        // 2. Cria Posição
        var position = new Position {
            Name = request.Name,
            DepartmentId = departmentId,
            IsActive = request.IsActive
        };

        // 3. Mapeia Acessos (RBAC Matrix)
        if (request.Accesses != null) {
            foreach(var acc in request.Accesses) {
                position.Accesses.Add(new Access {
                    ScreenId = acc.ScreenId,
                    PermissionId = acc.PermissionId
                });
            }
        }

        _context.Positions.Add(position);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>("200", "Posição criada com sucesso", new { id = position.Id });
    }

    public async Task<ApiResponse<object>> DeletePositionAsync(int positionId)
    {
        var position = await _context.Positions
            .Include(p => p.ProfileTeams)
            .FirstOrDefaultAsync(p => p.Id == positionId);

        if (position == null)
            return new ApiResponse<object>("404", "Posição não encontrada", null);

        // Não pode deletar se tem usuários vinculados
        if (position.ProfileTeams.Any())
            return new ApiResponse<object>("400",
                "Não é possível deletar. Existem usuários vinculados.", null);

        _context.Positions.Remove(position);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>("200",
            "Posição deletada com sucesso", null);
    }

    // === TEAMS ===

    public async Task<ApiResponse<List<TeamResponse>>> GetTeamsAsync()
    {
        var teams = await _context.Teams
            .Where(t => t.IsActive)
            .Select(t => new TeamResponse(t.Id, t.Name, t.LogotipoUrl, t.IsActive))
            .ToListAsync();

        return new ApiResponse<List<TeamResponse>>("200", "", teams);
    }

    public async Task<ApiResponse<object>> CreateTeamAsync(TeamResponse request)
    {
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            LogotipoUrl = request.LogotipoUrl,
            IsActive = true
        };

        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>("200",
            "Time criado com sucesso",
            new { id = team.Id, name = team.Name });
    }

    // === SCREENS ===

    public async Task<ApiResponse<List<ScreenResponse>>> GetScreensAsync()
    {
        var screens = await _context.Screens
            .Select(s => new ScreenResponse(s.Id, s.Name, s.NameSidebar, s.NameKey))
            .ToListAsync();

        return new ApiResponse<List<ScreenResponse>>("200", "", screens);
    }

    public async Task<ApiResponse<object>> UpdateScreenAsync(
        int screenId, ScreenResponse request)
    {
        var screen = await _context.Screens.FindAsync(screenId);
        if (screen == null)
            return new ApiResponse<object>("404", "Tela não encontrada", null);

        // NameKey não pode ser alterado
        if (screen.NameKey != request.NameKey)
            return new ApiResponse<object>("400",
                "NameKey não pode ser alterado", null);

        screen.Name = request.Name;
        screen.NameSidebar = request.NameSidebar;

        _context.Screens.Update(screen);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>("200",
            "Tela atualizada com sucesso",
            new { id = screen.Id, name = screen.Name });
    }

    private string GenerateTemporaryPassword()
    {
        // Gera senha temporária do padrão: "Temp@123x"
        return $"Temp@{Guid.NewGuid().ToString().Substring(0, 5).ToUpper()}";
    }
}
```

---

## 📧 IEmailService

Contrato para envio de emails.

```csharp
public interface IEmailService
{
    /// <summary>
    /// Envia email de convite de acesso.
    /// </summary>
    Task SendInvitationEmailAsync(string email, string inviteLink);

    /// <summary>
    /// Envia email com código OTP.
    /// </summary>
    Task SendOtpAsync(string email, string code);
}
```

### EmailService (Implementação)

```csharp
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendInvitationEmailAsync(string email, string inviteLink)
    {
        await SendAsync(
            email,
            "Bem-vindo ao Sistema - Convite de Acesso",
            $"Olá!\n\nSua conta foi criada com sucesso.\n" +
            $"Use o link abaixo para definir sua senha inicial:\n{inviteLink}\n\n" +
            $"Este link expira em breve.");
    }

    public async Task SendOtpAsync(string email, string code)
    {
        await SendAsync(
            email,
            "Código de Verificação",
            $"Seu código de verificação é: {code}\n\n" +
            $"Este código expira em 10 minutos.");
    }

    private async Task SendAsync(string toEmail, string subject, string body)
    {
        var host = _configuration["Smtp:Host"] ?? "localhost";
        var port = int.Parse(_configuration["Smtp:Port"] ?? "1025");
        var sender = _configuration["Smtp:SenderEmail"] ?? "noreply@dainai.local";
        var senderName = _configuration["Smtp:SenderName"] ?? "Dainai";

        using var client = new SmtpClient(host, port);
        using var mailMessage = new MailMessage();
        mailMessage.From = new MailAddress(sender, senderName);
        mailMessage.To.Add(toEmail);
        mailMessage.Subject = subject;
        mailMessage.Body = body;
        mailMessage.IsBodyHtml = false;

        await client.SendMailAsync(mailMessage);
    }
}
```

**Configuração em .env**:

```
Smtp__Host=mailhog
Smtp__Port=1025
Smtp__SenderEmail=noreply@dainai.local
Smtp__SenderName=Dainai
```

---

## 💾 ICacheService

Contrato para operações de cache.

```csharp
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task DeleteAsync(string key);
    Task SetAsync<T>(string key, T value);
}
```

### CacheService (Implementação com Redis)

```csharp
public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var json = await _cache.GetStringAsync(key);
            if (string.IsNullOrEmpty(json))
                return default;

            return JsonSerializer.Deserialize<T>(json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro ao obter cache {key}");
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        try
        {
            var json = JsonSerializer.Serialize(value);
            var options = new DistributedCacheEntryOptions();

            if (expiration.HasValue)
                options.AbsoluteExpirationRelativeToNow = expiration;

            await _cache.SetStringAsync(key, json, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro ao definir cache {key}");
        }
    }

    public async Task DeleteAsync(string key)
    {
        try
        {
            await _cache.RemoveAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erro ao deletar cache {key}");
        }
    }

    public async Task SetAsync<T>(string key, T value)
    {
        await SetAsync(key, value, null);
    }
}
```

**Configuração em Program.cs**:

```csharp
if (!string.IsNullOrEmpty(builder.Configuration["Redis:ConnectionString"]))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = builder.Configuration["Redis:ConnectionString"];
    });
}
```

---

## 📊 Diagrama de Fluxo de Serviços

```
Request → Controller → Service → Database
                           ↓
                       Cache (Redis)
                           ↓
                       Email (SMTP)
                           ↓
                       Response DTO
```

---

## 🔗 Documentação Relacionada

- [AUTHENTICATION.md](AUTHENTICATION.md) - Detalhe das operações de auth
- [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md) - Lógica de RBAC
- [MODELS.md](MODELS.md) - Estrutura de DTOs

---

**Próximos passos?** 👉 Leia [DATABASE.md](DATABASE.md) para migrações e seed.

---

## 🆕 Atualizacao Abril 2026

### Novos contratos de serviço

`IAuthService`:

- `Task<bool> HasPermissionAsync(Guid userId, Guid? activeTeamId, string screen, string permission)`

`IAdminService` (Teams):

- `Task<ApiResponse<TeamResponse>> CreateTeamAsync(SaveTeamRequest request)`
- `Task<ApiResponse<TeamResponse>> UpdateTeamAsync(Guid id, SaveTeamRequest request)`
- `Task<ApiResponse<object>> DeleteTeamAsync(Guid id)`

`IFileService`:

- `Task<string> SaveFileAsync(IFormFile file, string subFolder = "uploads")`
- `void DeleteFile(string? fileUrl)`

### Comportamento novo no AdminService

- `GetTeamsAsync` agora ignora registros com `DeletedAt` (soft delete).
- `CreateTeamAsync` e `UpdateTeamAsync` trabalham com `iconUrl`, `logotipoUrl` e `isActive`.
- `DeleteTeamAsync` aplica remoção lógica e bloqueia exclusão quando há vínculos em `ProfileTeams`.
- `UpdateTeamAsync` remove arquivos antigos quando## 📁 IFileService

Novo serviço centralizado para gerenciamento de arquivos físicos (como logotipos de equipes).

```csharp
public interface IFileService
{
    /// <summary>
    /// Salva um arquivo no sistema de arquivos local.
    /// </summary>
    Task<string> SaveFileAsync(IFormFile file, string subFolder = "uploads");

    /// <summary>
    /// Remove um arquivo físico no sistema de arquivos local.
    /// </summary>
    void DeleteFile(string? fileUrl);
}
```

### FileService (Implementação)

- **Localização**: `wwwroot/uploads` é o diretório raiz para persistência.
- **Segurança**: Métodos de exclusão validam se o arquivo está dentro do escopo permitido antes de tentar a remoção.
- **URLs**: Retorna caminhos relativos (ex: `/uploads/logo.png`) que são servidos como arquivos estáticos pela API.

---

## 🚀 Melhorias no AdminService (Abril 2026)

### Gestão de Arquivos e Limpeza

O `AdminService` agora integra o `IFileService` para garantir que arquivos órfãos não acumulem no servidor:

- **Update**: Ao atualizar o logotipo de uma equipe, o arquivo anterior é detectado e excluído fisicamente se for diferente do novo.
- **Delete**: Ao realizar a exclusão lógica de um registro, os assets vinculados podem ser removidos conforme a política de retenção.

### Tipagem e Segurança

- Implementação rigorosa de null-conditional operators e validações de nulidade para evitar `NullReferenceException`.
- Ajuste nos contratos de `UpdateTeamAsync` e `CreatePositionAsync` para suportar novos campos de metadados.
