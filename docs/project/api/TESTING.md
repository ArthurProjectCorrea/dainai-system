# Testes

### 🧪 Estratégia de Testes

A API possui testes em dois níveis principais:

1. **Unitários/Controller**: Testes isolados com banco em memória (`WebApplicationFactory`).
2. **E2E (End-to-End)**: Testes abrangentes contra a stack Docker real (API, DB, Redis, MailHog).

```
┌─────────────────────────────────────────┐
│ Test Categories                         │
├─────────────────────────────────────────┤
│ ✅ Unit/Integration     [✗ E2E]        │ Rodam rápido (~5s)
│ ✅ E2E (Full Stack)     [✗ Unit]       │ Rodam contra Docker (~30s)
└─────────────────────────────────────────┘
```

---

## 📁 Estrutura de Testes

A suíte de testes foi expandida e modularizada para facilitar a manutenção:

```
Apps/api/Api.Tests/
├── E2E/                         # Testes End-to-End (Stack Real)
│   ├── AccessControlE2ETests.cs # Departamentos, Cargos, Permissões
│   ├── AuthE2ETests.cs          # Login, Logout, Forgot/Reset Password
│   ├── DocumentsE2ETests.cs     # Lifecycle de Documentos, Versões
│   ├── FeedbackPublicApiE2ETests.cs # Public API Integrations
│   ├── ProjectsE2ETests.cs      # Projetos, Indicadores, Tokens
│   ├── TeamsE2ETests.cs         # Gerenciamento de Equipes
│   └── UsersE2ETests.cs         # Gestão de Usuários e Convites
├── TestWebApplicationFactory.cs # Factory para test setup (In-Memory)
├── DockerApiFixture.cs          # Fixture para testes E2E (Docker)
└── Api.Tests.csproj
```

---

## 🏗️ Fixtures de Teste

### 1. TestWebApplicationFactory (In-Memory)
Utilizado para testes de integração de baixo nível e controllers isolados.
- ⚡ **Vantagem**: Velocidade.
- ⚠️ **Limitação**: Não testa persistência real em Postgres ou cache em Redis.

### 2. DockerApiFixture (Docker)
Utilizado para os testes **E2E**.
- 🌐 **Vantagem**: Testa o comportamento real do sistema, incluindo headers, cookies, banco de dados e envio de e-mails.
- 🍪 **Recursos**: Gerenciamento automático de cookies, autenticação administrativa prévia e extração de OTP via MailHog.

---

## ✅ Rodando os Testes

### Testes Globais (Monorepo)
```bash
npm run test
```

### Apenas Testes E2E (API)
```bash
# Pré-requisito: Docker stack rodando
docker compose up -d

# Executar testes
npm run test:e2e
```

**Métricas Atuais (Abril 2026):**
- **Total de Testes E2E**: 76
- **Status**: 100% Pass
- **Cobertura**: Sucesso e Erros (400, 401, 403, 404) para todos os módulos principais.

---

## 📊 Cobertura de Endpoints (E2E)

| Módulo             | Cenários de Sucesso | Cenários de Erro (400/404/401) |
| ------------------ | ------------------- | ------------------------------ |
| **Auth**           | ✅ Completo          | ✅ Completo                     |
| **Access Control** | ✅ Completo          | ✅ Completo                     |
| **Documents**      | ✅ Completo          | ✅ Completo                     |
| **Projects**       | ✅ Completo          | ✅ Completo                     |
| **Teams**          | ✅ Completo          | ✅ Completo                     |
| **Users**          | ✅ Completo          | ✅ Completo                     |
| **Public Feedback**| ✅ Completo          | ✅ Completo                     |auth/login           | ✅   | ❌  |
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
