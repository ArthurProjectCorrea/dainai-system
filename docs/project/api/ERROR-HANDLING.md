# Tratamento de Erros

## 📋 Padrão de Resposta de Erro

Todos os erros da API retornam um objeto padronizado com três campos:

```json
{
  "code": "string", // Código único (ex: "400", "AUTH_INVALID_EMAIL")
  "message": "string", // Mensagem legível em PT-BR
  "data": null // Sempre null em erros
}
```

---

## 🔴 Códigos de Erro HTTP

### 400 - Bad Request

Requisição inválida (validação de entrada).

**Causa**: Dados incompletos, inválidos ou que violam regras de negócio.

**Exemplos**:

```json
{
  "code": "400",
  "message": "Email já está em uso",
  "data": null
}
```

```json
{
  "code": "400",
  "message": "Senha não atende aos requisitos (mín. 8 caracteres, 1 dígito, 1 caractere especial)",
  "data": null
}
```

```json
{
  "code": "400",
  "message": "A confirmação de senha não confere.",
  "data": null
}
```

---

### 401 - Unauthorized

Autenticação falhou ou sessão expirou.

**Causa**: Cookie inválido, expirado, ou credenciais incorretas.

**Exemplos**:

```json
{
  "code": "401",
  "message": "Credenciais inválidas",
  "data": null
}
```

```json
{
  "code": "401",
  "message": "Sessão inválida ou expirada",
  "data": null
}
```

```json
{
  "code": "401",
  "message": "Contexto de reset inválido ou expirado.",
  "data": null
}
```

**Ações Recomendadas**:

- 🔄 Refreshar e tentar novamente
- 📝 Fazer login novamente
- 🔐 Solicitar nova recuperação de senha se necessário

---

### 403 - Forbidden

Autenticação OK, mas autorização falhou.

**Causa**: User logado mas sem permissão para acessar recurso.

**Exemplo**:

```json
{
  "code": "403",
  "message": "Você não tem permissão para acessar este recurso",
  "data": null
}
```

**Casos**:

- Tentar acessar GET /admin/profiles sem permissão `users_management:view`
- Tentar criar usuário sem permissão `users_management:create`

---

### 404 - Not Found

Recurso não encontrado.

**Causa**: ID inválido ou recurso deletado.

**Exemplos**:

```json
{
  "code": "404",
  "message": "Perfil não encontrado",
  "data": null
}
```

```json
{
  "code": "404",
  "message": "Posição não existe",
  "data": null
}
```

---

### 429 - Too Many Requests

Rate limit excedido (brute force).

**Causa**: Muitas tentativas em pouco tempo.

**Exemplos**:

```json
{
  "code": "429",
  "message": "Muitas tentativas de verificação. Tente novamente em 1 hora.",
  "data": null
}
```

```json
{
  "code": "429",
  "message": "Muitas tentativas de reset. Aguarde antes de tentar novamente.",
  "data": null
}
```

**Rate Limits Implementados**:

- OTP forgot-password: 5 tentativas por email / hora
- OTP verify: 5 tentativas por email / hora
- Identity lockout: 5 tentativas de login / 15 minutos

---

### 500 - Internal Server Error

Erro não previsto no servidor.

**Causa**: Bug ou exceção não tratada.

**Exemplo**:

```json
{
  "code": "500",
  "message": "Erro interno do servidor",
  "data": null
}
```

**Dados Úteis**:

- Verificar logs do container: `docker compose logs api`
- Correlação ID no header `X-Correlation-ID` (futuro)

---

## 🎯 Mapeamento de Erros por Endpoint

### Auth

| Endpoint              | 200 | 400 | 401 | 429 |
| --------------------- | --- | --- | --- | --- |
| POST /login           | ✅  | -   | ✅  | -   |
| GET /me               | ✅  | -   | ✅  | -   |
| POST /logout          | ✅  | -   | ✅  | -   |
| POST /forgot-password | ✅  | -   | -   | ✅  |
| POST /verify-otp      | ✅  | ✅  | -   | ✅  |
| POST /reset-password  | ✅  | ✅  | ✅  | -   |

### Admin

| Endpoint                    | 200 | 201 | 400 | 401 | 403 | 404 |
| --------------------------- | --- | --- | --- | --- | --- | --- |
| GET /profiles               | ✅  | -   | -   | ✅  | ✅  | -   |
| POST /profiles              | -   | ✅  | ✅  | ✅  | ✅  | -   |
| DELETE /profiles/{id}       | ✅  | -   | -   | ✅  | ✅  | ✅  |
| GET /access-control         | ✅  | -   | -   | ✅  | ✅  | -   |
| POST /access-control        | ✅  | -   | ✅  | ✅  | ✅  | -   |
| DELETE /access-control/{id} | ✅  | -   | ✅  | ✅  | ✅  | ✅  |
| GET /teams                  | ✅  | -   | -   | ✅  | ✅  | -   |
| POST /teams                 | ✅  | -   | ✅  | ✅  | ✅  | -   |
| GET /screens                | ✅  | -   | -   | ✅  | ✅  | -   |
| PUT /screens/{id}           | ✅  | -   | ✅  | ✅  | ✅  | ✅  |

---

## 🛡️ Estratégia de Tratamento

### Implementação no Controller

```csharp
[HttpPost("create-profile")]
[HasPermission("users_management", "create")]
public async Task<IActionResult> CreateProfile([FromBody] CreateProfileRequest request)
{
    try
    {
        var response = await _adminService.CreateProfileAsync(request);

        // Retorna erro de negócio
        if (response.Code == "400")
            return BadRequest(response);

        // Retorna sucesso (201 Created)
        return CreatedAtAction(nameof(GetProfiles), response);
    }
    catch (Exception ex)
    {
        // Log da exceção (futuro)
        return StatusCode(500, new
        {
            code = "500",
            message = "Erro interno do servidor",
            data = null
        });
    }
}
```

### Validação em Serviço

```csharp
public async Task<ApiResponse<ProfileResponse>> CreateProfileAsync(
    CreateProfileRequest request)
{
    // 1. Validação de campos obrigatórios
    if (string.IsNullOrWhiteSpace(request.Email))
        return new ApiResponse<ProfileResponse>("400",
            "Email é obrigatório", null);

    // 2. Validação de regra de negócio
    var existingUser = await _userManager.FindByEmailAsync(request.Email);
    if (existingUser != null)
        return new ApiResponse<ProfileResponse>("400",
            "Email já está em uso", null);

    // 3. Validação de dependências
    var team = await _context.Teams.FindAsync(request.TeamId);
    if (team == null)
        return new ApiResponse<ProfileResponse>("400",
            "Time não existe", null);

    // 4. Se tudo OK, cria recurso
    var user = new User { UserName = request.Email, Email = request.Email };
    var result = await _userManager.CreateAsync(user, tempPassword);

    if (!result.Succeeded)
        return new ApiResponse<ProfileResponse>("400",
            $"Erro ao criar usuário: {string.Join(", ", result.Errors.Select(e => e.Description))}",
            null);

    // 5. Retorna sucesso
    return new ApiResponse<ProfileResponse>("200",
        "Perfil criado com sucesso",
        new ProfileResponse(profile.Id, profile.Name, profile.AvatarUrl,
                          profile.Email, profile.IsActive));
}
```

---

## 📊 Hierarquia de Validação

```
┌─────────────────────────────└──────────────────┐
│ 1. HTTP Parser                                 │
│    - Content-Type válido?                      │
│    - JSON válido?                              │
└──────────┬──────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────┐
│ 2. Model Binding                               │
│    - Tipos de dados corretos?                  │
│    - Campos obrigatórios presentes?            │
└──────────┬──────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────┐
│ 3. Middleware de Autenticação                  │
│    - Cookie válido?                            │
│    - UserId extraível?                         │
└──────────┬──────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────┐
│ 4. Atributo [Authorize]                        │
│    - User está autenticado?                    │
└──────────┬──────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────┐
│ 5. Atributo [HasPermission]                    │
│    - Tem permissão necessária?                 │
└──────────┬──────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────┐
│ 6. Lógica de Negócio (Serviço)                 │
│    - Validações específicas                    │
│    - Regras de integridade                     │
└──────────┬──────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────┐
│ 7. Banco de Dados                              │
│    - Constraints (unique, FK, etc)             │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Exemplos Prático

### Cenário: Erro de Validação

```bash
# Request com email inválido
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":"Admin123!"}'

# Response
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "code": "400",
  "message": "Email inválido",
  "data": null
}
```

### Cenário: Credenciais Inválidas

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"wrongpass"}'

# Response
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "code": "401",
  "message": "Credenciais inválidas",
  "data": null
}
```

### Cenário: Falta de Permissão

```bash
curl -X GET http://localhost:5000/api/v1/admin/profiles \
  -b "cookies.txt"  # User sem permissão users_management:view

# Response
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "code": "403",
  "message": "Você não tem permissão para acessar este recurso",
  "data": null
}
```

### Cenário: Rate Limit (OTP)

```bash
# Após 5 tentativas em 1 hora
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","code":"000000"}'

# Response
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 3600

{
  "code": "429",
  "message": "Muitas tentativas de verificação. Tente novamente em 1 hora.",
  "data": null
}
```

---

## 🛠️ Debugging

### Logs da API

```bash
# Ver logs em tempo real
docker compose logs -f api

# Ver logs do último 30min
docker compose logs --since 30m api

# Ver logs de um serviço específico
docker compose logs api --tail 100
```

### Verificar Status

```bash
# Health check
curl http://localhost:5000/health

# Swagger docs
open http://localhost:5000/swagger
```

---

## 📝 Boas Práticas

### ✅ Bom

```csharp
// Mensagem clara em português
if (!profile.IsActive)
    return new ApiResponse<ProfileResponse>("401",
        "Sessão inválida ou expirada", null);

// Validação específica (não genérica)
if (request.NewPassword != request.ConfirmPassword)
    return new ApiResponse<object>("400",
        "A confirmação de senha não confere.", null);

// HTTP status code correto (201 Created)
return CreatedAtAction(nameof(GetProfiles), response);
```

### ❌ Ruim

```csharp
// Mensagem genérica
return BadRequest("Error");

// Sem código específico
return StatusCode(999, "Erro desconhecido");

// Usar 200 para tudo
return Ok(errorResponse);  // Deveria ser 400, 401, etc
```

---

## 🔗 Documentação Relacionada

- [ENDPOINTS.md](ENDPOINTS.md) - Referência de APIs
- [AUTHENTICATION.md](AUTHENTICATION.md) - Fluxos de segurança
- [DEPLOYMENT.md](DEPLOYMENT.md) - Logs e debugging

---

**Próximos passos?** 👉 Leia [DEPLOYMENT.md](DEPLOYMENT.md) para infraestrutura.
