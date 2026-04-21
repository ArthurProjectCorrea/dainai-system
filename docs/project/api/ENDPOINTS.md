# Referência de Endpoints

## 📡 Base URL

```
http://localhost:5000/api/v1
```

---

## 🔐 Autenticação (`/auth`)

### 1. Login

Autentica um usuário e cria sessão de cookie.

```
POST /auth/login
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "email": "admin@empresa.com",
  "password": "Admin123!"
}
```

**Sucesso (200)**

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

**Erro (401)**

```json
{
  "code": "401",
  "message": "Credenciais inválidas",
  "data": null
}
```

**Permissões**: ✅ Público (`[AllowAnonymous]`)

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"Admin123!"}'
```

---

### 2. Obter Dados da Sessão

Retorna perfil e contexto RBAC por time do usuário autenticado.

```
GET /auth/me
```

**Headers**

```
Cookie: AuthToken=...
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "",
  "data": {
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
        "iconUrl": null,
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
            "name": "Gerenciamento de Usuários",
            "nameSidebar": "Usuários",
            "permissions": ["view", "create", "delete"]
          },
          {
            "nameKey": "teams_management",
            "name": "Gerenciamento de Times",
            "nameSidebar": "Equipes",
            "permissions": ["view", "create"]
          }
        ]
      },
      {
        "teamId": "d1000000-0000-0000-0000-000000000002",
        "position": "Analista Operacional",
        "department": "TI",
        "accesses": []
      }
    ]
  }
}
```

**Erro (401)**

```json
{
  "code": "401",
  "message": "Sessão inválida ou expirada",
  "data": null
}
```

**Permissões**: 🔒 Requer autenticação (`[Authorize]`)

**Cache**: ✅ Armazenado em Redis por **1 hora**

**cURL**

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -b "cookies.txt"
```

---

### 3. Logout

Encerra a sessão do usuário.

```
POST /auth/logout
```

**Headers**

```
Cookie: AuthToken=...
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Logout realizado com sucesso",
  "data": null
}
```

**Permissões**: 🔒 Requer autenticação

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -b "cookies.txt"
```

---

### 4. Forgot Password

Inicia fluxo de recuperação de senha gerando OTP.

```
POST /auth/forgot-password
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "email": "admin@empresa.com"
}
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Se o email existe, você receberá um código de verificação",
  "data": null
}
```

**Notas**:

- ✅ Sempre retorna 200 (não valida existência de email)
- 📧 Email com OTP é enviadopara Mailhog
- ⏱️ OTP válido por 10 minutos
- 🔒 Rate limited: máximo 5 tentativas em 1 hora

**Permissões**: ✅ Público (`[AllowAnonymous]`)

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com"}'
```

---

### 5. Verify OTP

Valida o código OTP enviado por email.

```
POST /auth/verify-otp
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "email": "admin@empresa.com",
  "code": "123456"
}
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "OTP verificado com sucesso",
  "data": {
    "resetToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresInMinutes": 30
  }
}
```

**Set-Cookie**

```
Reset-Token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Path=/api; SameSite=Strict
```

**Erros**:

- `400`: OTP inválido ou expirado
- `429`: Muitas tentativas (rate limit)

**Rate Limit**: 🔒 5 tentativas por email em 1 hora

**Permissões**: ✅ Público

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","code":"123456"}' \
  -c "cookies.txt"
```

---

### 6. Reset Password

Altera a senha com token de reset válido.

```
POST /auth/reset-password
```

**Headers**

```
Content-Type: application/json
Cookie: Reset-Token=...
```

**Body**

```json
{
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Senha atualizada com sucesso",
  "data": null
}
```

**Delete-Cookie**

```
Reset-Token=; Path=/api; expires=...
```

**Erros**:

- `400`: Senhas não conferem ou inválidas
- `401`: Reset-Token inválido ou expirado

**Requisitos de Senha**:

- Mínimo 8 caracteres
- Pelo menos 1 dígito
- Pelo menos 1 caractere não-alfanumérico

**Permissões**: ✅ Público (requer Reset-Token cookie)

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{"newPassword":"NewPass@123","confirmPassword":"NewPass@123"}'
```

---

## 👥 Admin - Gerenciamento de Usuários (`/admin/profiles`)

### 7. Listar Perfis

Lista todos os perfis de usuários.

```
GET /admin/profiles
```

**Permissões**: 🔒 `users_management:view`

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Administrador",
      "avatarUrl": null,
      "email": "admin@empresa.com",
      "isActive": true
    }
  ]
}
```

**cURL**

```bash
curl -X GET http://localhost:5000/api/v1/admin/profiles \
  -b "cookies.txt"
```

---

### 8. Criar Perfil

Cria novo perfil de usuário com email e time.

```
POST /admin/profiles
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "name": "João Silva",
  "email": "joao.silva@empresa.com",
  "teamId": "660e8400-e29b-41d4-a716-446655440000",
  "positionId": 2
}
```

**Validações**:
- `name`: Obrigatório
- `email`: Obrigatório, formato válido, único no sistema
- `teamId`: Obrigatório, UUID de um time existente
- `positionId`: Obrigatório, ID de um cargo existente

**Sucesso (201)**

```json
{
  "code": "201",
  "message": "Perfil criado com sucesso",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "avatarUrl": null,
    "email": "joao.silva@empresa.com",
    "isActive": true
  }
}
```

**Erros**:

- `400`: Email já existe, team ou position inválidos
- `400`: Dados incompletos

**Ações Pós-Criação**:

- ✅ Usuário é criado no Identity
- ✅ Email de convite é enviado
- ✅ Vinculação a time/posição é registrada

**Permissões**: 🔒 `users_management:create`

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/admin/profiles \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "teamId": "660e8400-e29b-41d4-a716-446655440000",
    "positionId": 2
  }'
```

---

### 9. Toggle Profile Active (Soft Delete)

Desativa ou ativa um perfil de usuário.

```
DELETE /admin/profiles/{id}
```

**Path Parameters**

```
id: uuid (ex: 550e8400-e29b-41d4-a716-446655440000)
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Perfil atualizado com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": false
  }
}
```

**Permissões**: 🔒 `users_management:delete`

**Efeitos**:

- Sessão ativa é revogada
- Cache RBAC é invalidado
- `is_active` é alternado (true ↔ false)

**cURL**

```bash
curl -X DELETE http://localhost:5000/api/v1/admin/profiles/550e8400-e29b-41d4-a716-446655440000 \
  -b "cookies.txt"
```

---

## 🔑 Admin - Controle de Acesso (`/admin/access-control`)

### 10. Obter Controle de Acesso

Retorna posições, departamentos, telas e permissões do sistema.

```
GET /admin/access-control
```

**Permissões**: 🔒 `access_control:view`

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Administrador",
        "departmentId": 1,
        "isActive": true,
        "screenPermissions": [1, 2, 3, 4, 5],
        "accesses": [
          { "screenId": 1, "permissionId": 1 },
          { "screenId": 1, "permissionId": 2 }
        ]
      }
    ],
    "departments": [
      {
        "id": 1,
        "name": "TI"
      }
    ],
    "permissions": [
      {
        "id": 1,
        "name": "Visualizar",
        "nameKey": "view"
      },
      {
        "id": 2,
        "name": "Criar",
        "nameKey": "create"
      }
    ],
    "screens": [
      {
        "id": 1,
        "name": "Gerenciamento de Usuários",
        "nameSidebar": "Usuários",
        "nameKey": "users_management"
      }
    ]
  }
}
```

**Nota**: `screenPermissions` é uma lista legada de IDs de permissões. O frontend moderno utiliza a lista `accesses` para maior precisão.

**cURL**

```bash
curl -X GET http://localhost:5000/api/v1/admin/access-control \
  -b "cookies.txt"
```

---

### 11. Criar Posição

Cria nova posição/cargo no sistema.

```
POST /admin/access-control
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "name": "Analista Jr.",
  "departmentId": 1,
  "newDepartmentName": null,
  "isActive": true,
  "accesses": [
    { "screenId": 1, "permissionId": 1 },
    { "screenId": 2, "permissionId": 1 }
  ]
}
```

**Departamentos Dinâmicos**: Se `departmentId` for `0` e `newDepartmentName` for fornecido, a API criará o departamento automaticamente (ou usará um existente com o mesmo nome, case-insensitive).

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Posição criada com sucesso",
  "data": {
    "id": 3,
    "name": "Analista Jr.",
    "departmentId": 1,
    "isActive": true,
    "screenPermissions": []
  }
}
```

**Permissões**: 🔒 `access_control:create`

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/admin/access-control \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{
    "name": "Analista Jr.",
    "departmentId": 1,
    "isActive": true,
    "accesses": [{ "screenId": 1, "permissionId": 1 }]
  }'
```

---

### 11.1 Editar Posição

Atualiza os dados e permissões de uma posição.

```
PUT /admin/access-control/positions/{id}
```

**Body**: Igual ao de criação.

**Permissões**: 🔒 `access_control:update`

---

### 12. Deletar Posição

Remove uma posição/cargo do sistema.

```
DELETE /admin/access-control/{id}
```

**Path Parameters**

```
id: int (ex: 3)
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Posição deletada com sucesso",
  "data": null
}
```

**Erro (400)**

```json
{
  "code": "400",
  "message": "Não é possível deletar. Existem usuários vinculados.",
  "data": null
}
```

**Permissões**: 🔒 `access_control:delete`

**Constraints**:

- ❌ Não pode deletar se há usuários vinculados
- ❌ Não pode deletar posições do seed (sistema)

**cURL**

```bash
curl -X DELETE http://localhost:5000/api/v1/admin/access-control/3 \
  -b "cookies.txt"
```

---

## 👨‍💼 Admin - Gerenciamento de Times (`/admin/teams`)

### 13. Listar Teams

Lista todos os times/departamentos.

```
GET /admin/teams
```

**Permissões**: 🔒 `teams_management:view`

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Operações",
      "logotipoUrl": null,
      "isActive": true
    }
  ]
}
```

**cURL**

```bash
curl -X GET http://localhost:5000/api/v1/admin/teams \
  -b "cookies.txt"
```

---

### 14. Criar Team

Cria novo time/departamento.

```
POST /admin/teams
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "name": "Desenvolvimento",
  "iconUrl": "/uploads/icon.png",
  "logotipoUrl": null,
  "isActive": true
}
```

**Sucesso (201)**

```json
{
  "code": "201",
  "message": "Equipe criada com sucesso",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Desenvolvimento",
    "iconUrl": "/uploads/icon.png",
    "logotipoUrl": null,
    "isActive": true
  }
}
```

**Permissões**: 🔒 `teams_management:create`

**cURL**

```bash
curl -X POST http://localhost:5000/api/v1/admin/teams \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{
    "name": "Desenvolvimento",
    "logotipoUrl": null,
    "isActive": true
  }'
```

---

### 15. Atualizar Time

Atualiza os dados de uma equipe existente.

```
PUT /admin/teams/{id}
```

**Path Parameters**

```
id: Guid (ex: d123...)
```

**Body**

```json
{
  "name": "Marketing Digital",
  "iconUrl": "/uploads/icon-marketing.png",
  "logotipoUrl": "/uploads/logo.png",
  "isActive": true
}
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Equipe atualizada com sucesso",
  "data": {
    "id": "d123...",
    "name": "Marketing Digital",
    "iconUrl": "/uploads/icon-marketing.png",
    "logotipoUrl": "/uploads/logo.png",
    "isActive": true
  }
}
```

**Permissões**: 🔒 `teams_management:update`

---

### 16. Remover Time (Soft Delete)

Remove uma equipe logicamente (setando `DeletedAt`).

```
DELETE /admin/teams/{id}
```

**Path Parameters**

```
id: Guid (ex: d123...)
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Equipe removida com sucesso",
  "data": null
}
```

**Permissões**: 🔒 `teams_management:delete`

**Erros comuns**:

- `400`: Equipe possui usuários vinculados
- `404`: Equipe não encontrada

---

## 📁 Storage (`/storage`)

### 17. Upload de Arquivo

Realiza upload de imagem para uso em equipes e retorna URL pública.

```
POST /storage/upload
```

**Headers**

```
Content-Type: multipart/form-data
```

**Body**

- `file`: imagem (`.jpg`, `.jpeg`, `.png`, `.webp`)

**Regras**

- Tamanho máximo: `2MB`
- Extensões permitidas: `.jpg`, `.jpeg`, `.png`, `.webp`

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Upload realizado com sucesso",
  "data": "/uploads/6f7c3a2f-e8f4-4b15-9903-8f4be54f4209.png"
}
```

**Erros**

- `400`: nenhum arquivo enviado
- `400`: extensão não permitida
- `400`: arquivo acima de 2MB
- `500`: erro interno no salvamento

**Permissões**: 🔒 Requer autenticação (`[Authorize]`)

---

## 🖥️ Admin - Gerenciamento de Telas (`/admin/screens`)

### 18. Listar Screens

Lista todas as telas/módulos do sistema.

```
GET /admin/screens
```

**Permissões**: 🔒 `screens_management:view`

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "",
  "data": [
    {
      "id": 1,
      "name": "Gerenciamento de Usuários",
      "nameSidebar": "Usuários",
      "nameKey": "users_management"
    }
  ]
}
```

**cURL**

```bash
curl -X GET http://localhost:5000/api/v1/admin/screens \
  -b "cookies.txt"
```

---

### 19. Atualizar Screen

Atualiza propriedades de uma tela.

```
PUT /admin/screens/{id}
```

**Path Parameters**

```
id: int (ex: 1)
```

**Headers**

```
Content-Type: application/json
```

**Body**

```json
{
  "id": 1,
  "name": "Gestão de Usuários",
  "nameSidebar": "Usuários",
  "nameKey": "users_management"
}
```

**Sucesso (200)**

```json
{
  "code": "200",
  "message": "Tela atualizada com sucesso",
  "data": {
    "id": 1,
    "name": "Gestão de Usuários",
    "nameSidebar": "Usuários",
    "nameKey": "users_management"
  }
}
```

**Permissões**: 🔒 `screens_management:update`

**Constraints**:

- ⚠️ `nameKey` não pode ser alterado (identificador imutável)

**cURL**

```bash
curl -X PUT http://localhost:5000/api/v1/admin/screens/1 \
  -H "Content-Type: application/json" \
  -b "cookies.txt" \
  -d '{
    "id": 1,
    "name": "Gestão de Usuários",
    "nameSidebar": "Usuários",
    "nameKey": "users_management"
  }'
```

---

## 📊 Resumo de Endpoints

| #   | Método | Endpoint                     | Autenticação | Permissão                   | Descrição        |
| --- | ------ | ---------------------------- | ------------ | --------------------------- | ---------------- |
| 1   | POST   | `/auth/login`                | ✅ Pública   | -                           | Fazer login      |
| 2   | GET    | `/auth/me`                   | 🔒 Requerida | -                           | Dados da sessão  |
| 3   | POST   | `/auth/logout`               | 🔒 Requerida | -                           | Fazer logout     |
| 4   | POST   | `/auth/forgot-password`      | ✅ Pública   | -                           | Solicitar reset  |
| 5   | POST   | `/auth/verify-otp`           | ✅ Pública   | -                           | Validar OTP      |
| 6   | POST   | `/auth/reset-password`       | ✅ Pública   | -                           | Alterar senha    |
| 7   | GET    | `/admin/profiles`            | 🔒 Requerida | `users_management:view`     | Listar usuários  |
| 8   | POST   | `/admin/profiles`            | 🔒 Requerida | `users_management:create`   | Criar usuário    |
| 9   | DELETE | `/admin/profiles/{id}`       | 🔒 Requerida | `users_management:delete`   | Deletar usuário  |
| 10  | GET    | `/admin/access-control`      | 🔒 Requerida | `access_control:view`       | Obter RBAC       |
| 11  | POST   | `/admin/access-control`      | 🔒 Requerida | `access_control:create`     | Criar cargo      |
| 12  | DELETE | `/admin/access-control/{id}` | 🔒 Requerida | `access_control:delete`     | Deletar cargo    |
| 13  | GET    | `/admin/teams`               | 🔒 Requerida | `teams_management:view`     | Listar times     |
| 14  | POST   | `/admin/teams`               | 🔒 Requerida | `teams_management:create`   | Criar time       |
| 15  | PUT    | `/admin/teams/{id}`          | 🔒 Requerida | `teams_management:update`   | Atualizar time   |
| 16  | DELETE | `/admin/teams/{id}`          | 🔒 Requerida | `teams_management:delete`   | Remover time     |
| 17  | POST   | `/storage/upload`            | 🔒 Requerida | -                           | Upload de imagem |
| 18  | GET    | `/admin/screens`             | 🔒 Requerida | `screens_management:view`   | Listar telas     |
| 19  | PUT    | `/admin/screens/{id}`        | 🔒 Requerida | `screens_management:update` | Atualizar tela   |

---

## 🔗 Documentação Relacionada

- [AUTHENTICATION.md](AUTHENTICATION.md) - Detalhes dos fluxos de auth
- [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md) - Sistema de permissões
- [ERROR-HANDLING.md](ERROR-HANDLING.md) - Códigos de erro e tratamento

---

**Próximos passos?** 👉 Leia [AUTHENTICATION.md](AUTHENTICATION.md) para detalhar fluxos de segurança.
