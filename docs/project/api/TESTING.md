# Testes

## 🧪 Estratégia de Testes

A API possui testes em dois níveis:

1. **Unitários/Controller**: Testes isolados com banco em memória
2. **E2E (End-to-End)**: Testes contra stack Docker ao vivo

```
┌─────────────────────────────────────────┐
│ Test Categories                         │
├─────────────────────────────────────────┤
│ ✅ Unit/Controller      [✗ E2E]        │ Rodam rápido (~5s)
│ [Unit/Controller]       ✅ E2E          │ Rodam contra Docker (~30s)
└─────────────────────────────────────────┘
```

---

## 📁 Estrutura de Testes

```
Apps/api/Api.Tests/
├── AuthControllerTests.cs        # Testes de autenticação
├── RealIntegrationTests.cs       # Testes E2E com Docker
├── TestWebApplicationFactory.cs  # Factory para test setup
└── Api.Tests.csproj
```

---

## 🏭 TestWebApplicationFactory

Configura aplicação para testes com in-memory database.

```csharp
public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Força TEST_MODE
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "TEST_MODE", "true" },
                    { "SeedDatabase", "true" }
                })
                .Build();

            services.AddSingleton<IConfiguration>(config);
        });
    }
}
```

**Funcionar**:

- 🗄️ Cria banco em memória isolado para cada teste
- ✅ Popula seed data automaticamente
- 🔐 Simula cookies e sessões
- ⚡ Rápido (sem I/O de rede)

---

## ✅ Testes Unitários/Controller

### AuthControllerTests.cs

```csharp
[Collection("Authentication")]
public class AuthControllerTests : IAsyncLifetime
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthControllerTests()
    {
        _factory = new TestWebApplicationFactory();
        _client = _factory.CreateClient();
    }

    public async Task InitializeAsync() { }
    public async Task DisposeAsync() => _factory.Dispose();

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturn200()
    {
        // Arrange
        var request = new LoginRequest("admin@empresa.com", "Admin123!");
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/v1/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(json);
        result.Code.Should().Be("200");
        result.Data.Email.Should().Be("admin@empresa.com");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturn401()
    {
        // Arrange
        var request = new LoginRequest("admin@empresa.com", "wrongpassword");
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/v1/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(json);
        result.Code.Should().Be("401");
    }

    [Fact]
    public async Task ForgotPassword_ShouldAlwaysReturnSuccess()
    {
        // Arrange
        var request = new ForgotPasswordRequest("admin@empresa.com");
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/v1/auth/forgot-password", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<object?>>(json);
        result.Code.Should().Be("200");
    }

    [Fact]
    public async Task Me_WithoutAuthentication_ShouldReturn401()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

**Padrão AAA**:

- **Arrange**: Setup de dados e configuração
- **Act**: Executa a ação
- **Assert**: Valida resultado

---

### Rodando Testes Unitários

```bash
# Rodar todos os testes (menos E2E)
npm run test

# Output
# xUnit test runner (.NET Framework 10.0.0, platform: Linux, arch: x64)
#   Discovering: Api.Tests
#   Discovered:  4 tests
#   Starting:    4 tests
#   Finished:    4 tests
# ========== 0.750s ==========
# PASS  Api.Tests
#
# Tests:     4 passed, 4 total
```

---

## 🌐 Testes E2E (End-to-End)

### RealIntegrationTests.cs

```csharp
[Trait("Category", "E2E")]
public class RealIntegrationTests
{
    private readonly HttpClient _client;
    private readonly CookieContainer _cookies = new();

    public RealIntegrationTests()
    {
        var handler = new HttpClientHandler { CookieContainer = _cookies };
        _client = new HttpClient(handler)
        {
            BaseAddress = new Uri("http://localhost:5000")
        };
    }

    [Fact]
    public async Task AdminFlow_CreateProfile_And_ListShouldPersistInDatabase()
    {
        // 1. Login como admin
        await LoginAsAdminAsync();

        // 2. Criar novo perfil
        var newProfileRequest = new CreateProfileRequest(
            Name: "João da Silva",
            Email: $"joao_{'$' + Guid.NewGuid().ToString().Substring(0, 5)}@empresa.com",
            TeamId: Guid.Parse("660e8400-e29b-41d4-a716-446655440000"), // Time seeded
            PositionId: 2  // Supervisor
        );

        var createContent = new StringContent(
            JsonSerializer.Serialize(newProfileRequest),
            Encoding.UTF8,
            "application/json"
        );

        var createResponse = await _client.PostAsync(
            "/api/v1/admin/profiles",
            createContent
        );

        // Assert criação
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // 3. Listar perfis para validar persistência
        var listResponse = await _client.GetAsync("/api/v1/admin/profiles");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var listJson = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<List<ProfileResponse>>>(listJson);
        listResult.Data.Should().Contain(p =>
            p.Name == newProfileRequest.Name &&
            p.Email == newProfileRequest.Email
        );
    }

    [Fact]
    public async Task AuthFlow_ForgotVerifyReset_ShouldRotatePassword()
    {
        // 1. Solicitar reset
        var forgotRequest = new ForgotPasswordRequest("admin@empresa.com");
        var forgotContent = new StringContent(
            JsonSerializer.Serialize(forgotRequest),
            Encoding.UTF8,
            "application/json"
        );

        var forgotResponse = await _client.PostAsync(
            "/api/v1/auth/forgot-password",
            forgotContent
        );

        forgotResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // 2. Extrair OTP de Mailhog
        var otp = await WaitForLatestOtpAsync("admin@empresa.com");
        otp.Should().NotBeNullOrEmpty();

        // 3. Verificar OTP
        var verifyRequest = new VerifyOtpRequest("admin@empresa.com", otp);
        var verifyContent = new StringContent(
            JsonSerializer.Serialize(verifyRequest),
            Encoding.UTF8,
            "application/json"
        );

        var verifyResponse = await _client.PostAsync(
            "/api/v1/auth/verify-otp",
            verifyContent
        );

        verifyResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Extrai Reset-Token do cookie
        var setCookieHeader = verifyResponse.Headers
            .SingleOrDefault(header => header.Key == "Set-Cookie").Value;
        setCookieHeader.Should().NotBeNull();

        // 4. Reset de senha
        var resetRequest = new ResetPasswordRequest("NewPass@123", "NewPass@123");
        var resetContent = new StringContent(
            JsonSerializer.Serialize(resetRequest),
            Encoding.UTF8,
            "application/json"
        );

        var resetResponse = await _client.PostAsync(
            "/api/v1/auth/reset-password",
            resetContent
        );

        resetResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // 5. Fazer login com nova senha
        var loginRequest = new LoginRequest("admin@empresa.com", "NewPass@123");
        var loginContent = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );

        var loginResponse = await _client.PostAsync(
            "/api/v1/auth/login",
            loginContent
        );

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // === Helpers ===

    private async Task LoginAsAdminAsync()
    {
        var loginRequest = new LoginRequest("admin@empresa.com", "Admin123!");
        var content = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/api/v1/auth/login", content);

        if (response.StatusCode != HttpStatusCode.OK)
        {
            // Tenta com nova senha (se rodou multiple vezes)
            loginRequest = new LoginRequest("admin@empresa.com", "NewPass@123");
            content = new StringContent(
                JsonSerializer.Serialize(loginRequest),
                Encoding.UTF8,
                "application/json"
            );

            response = await _client.PostAsync("/api/v1/auth/login", content);
        }

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private async Task<string> WaitForLatestOtpAsync(string email)
    {
        var mailhogClient = new HttpClient
        {
            BaseAddress = new Uri("http://localhost:8025")
        };

        // Aguarda até 30 segundos
        for (int i = 0; i < 30; i++)
        {
            try
            {
                var response = await mailhogClient.GetAsync("/api/v2/messages");
                var json = await response.Content.ReadAsStringAsync();
                var messages = JsonSerializer.Deserialize<MailhogResponse>(json);

                var latestMessage = messages?.Items
                    .FirstOrDefault(m => m.To.Any(t => t.Address == email));

                if (latestMessage != null)
                {
                    var match = Regex.Match(latestMessage.Raw.Data, @"(\d{6})");
                    if (match.Success)
                        return match.Groups[1].Value;
                }
            }
            catch { }

            await Task.Delay(1000);
        }

        throw new TimeoutException("OTP não encontrado em Mailhog após 30s");
    }
}
```

**Características**:

- 🌐 Testa contra API ao vivo em localhost:5000
- 📧 Extrai OTP diretamente de Mailhog
- 🍪 Gerencia cookies entre requisições
- ⏱️ Rate limit realista com timeouts

---

### Rodando Testes E2E

```bash
# Pré-requisito: Docker stack rodando
docker compose up -d

# Rodar apenas E2E
npm run test:e2e

# Output
# xUnit test runner (.NET Framework 10.0.0, platform: Linux, arch: x64)
#   Discovering: Api.Tests
#   Discovered:  2 tests (E2E only)
#   Starting:    2 tests
#   Finished:    2 tests
# ========== 32.456s ==========
# PASS  Api.Tests [E2E]
#
# Tests:     2 passed, 2 total
```

---

## 🔧 Ferramentas e Dependências

```xml
<!-- Api.Tests.csproj -->
<ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
    <PackageReference Include="xunit" Version="2.7.0" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Moq" Version="4.20.0" />
</ItemGroup>

<ItemGroup>
    <ProjectReference Include="../Api.Web/Api.Web.csproj" />
    <ProjectReference Include="../Api.Infrastructure/Api.Infrastructure.csproj" />
    <ProjectReference Include="../Api.Application/Api.Application.csproj" />
    <ProjectReference Include="../Api.Domain/Api.Domain.csproj" />
</ItemGroup>
```

---

## 📊 Cobertura de Testes

### Endpoints Cobertos

| Endpoint                   | Unit | E2E |
| -------------------------- | ---- | --- |
| POST /auth/login           | ✅   | ❌  |
| GET /auth/me               | ❌   | ❌  |
| POST /auth/logout          | ❌   | ❌  |
| POST /auth/forgot-password | ✅   | ✅  |
| POST /auth/verify-otp      | ❌   | ✅  |
| POST /auth/reset-password  | ❌   | ✅  |
| POST /admin/profiles       | ❌   | ✅  |
| GET /admin/profiles        | ❌   | ✅  |
| ... outros                 | ❌   | ❌  |

---

## 🎯 Boas Práticas

### ✅ Bom

```csharp
[Fact]
public async Task Login_WithInvalidCredentials_ShouldReturn401()
{
    // 1. Nome descritivo
    // 2. Padrão AAA claro
    var result = await Act();

    // 3. Assertion específica
    result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
}
```

### ❌ Ruim

```csharp
[Fact]
public async Task Test1()
{
    // Nome não descreve o teste
    // Sem organização AAA
    var result = svc.DoSomething();
    Assert.True(result);  // Assertion genérica
}
```

---

## 🚀 CI/CD

Para integração contínua, adicionar step em pipeline:

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm run test
    npm run test:e2e
```

---

## 🔗 Documentação Relacionada

- [ENDPOINTS.md](ENDPOINTS.md) - APIs testadas
- [AUTHENTICATION.md](AUTHENTICATION.md) - Fluxos funcionais
- [DEPLOYMENT.md](DEPLOYMENT.md) - Setup de Docker para testes

---

**Próximos passos?** 👉 Leia [DEPLOYMENT.md](DEPLOYMENT.md) para infraestrutura.
