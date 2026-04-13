# 📚 Índice de Documentação da API

## 🗺️ Mapa de Documentação

Esta página ajuda a navegar entre os arquivos de documentação da DAINAI API.

---

## 🎯 Comece Aqui

### Novo na API?

1. **[README.md](README.md)** ← Comece aqui!
   - Overview geral
   - Quick start
   - Stack técnico

2. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - Arquitetura em 4 camadas
   - Fluxo de requisição
   - Padrões de integração

3. **[ENDPOINTS.md](ENDPOINTS.md)**
   - Todos os 16 endpoints
   - Request/Response examples
   - Códigos HTTP

---

## 🔐 Segurança e Autenticação

### Entendendo os Fluxos

| Tópico          | Arquivo                                        | Descrição                  |
| --------------- | ---------------------------------------------- | -------------------------- |
| 🔐 Autenticação | [AUTHENTICATION.md](AUTHENTICATION.md)         | Login, OTP, reset de senha |
| 🔑 Autorização  | [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md) | RBAC, permissões, accesso  |
| ❌ Erros        | [ERROR-HANDLING.md](ERROR-HANDLING.md)         | Códigos HTTP, tratamento   |

---

## 💾 Dados e Modelos

### Estrutura de Dados

| Tópico     | Arquivo                                  | Descrição                        |
| ---------- | ---------------------------------------- | -------------------------------- |
| 📦 Modelos | [MODELS.md](MODELS.md)                   | Entidades, DTOs, relacionamentos |
| 🗄️ Banco   | [DATABASE.md](DATABASE.md)               | Schema, migrações, queries       |
| -          | [database-schema.md](database-schema.md) | Definição de tabelas (existente) |
| -          | [database-seed.md](database-seed.md)     | Seed strategy (existente)        |

---

## ⚙️ Implementação e Serviços

### Lógica de Negócio

| Tópico      | Arquivo                        | Descrição                     |
| ----------- | ------------------------------ | ----------------------------- |
| 🧠 Serviços | [SERVICES.md](SERVICES.md)     | Implementação de services, DI |
| 🧪 Testes   | [TESTING.md](TESTING.md)       | Unit tests, E2E, estratégia   |
| 🐳 Deploy   | [DEPLOYMENT.md](DEPLOYMENT.md) | Docker, Compose, variáveis    |

---

## 🔍 Navegação por Caso de Uso

### "Preciso integrar a API no frontend"

1. [ENDPOINTS.md](ENDPOINTS.md) - Veja todos os endpoints
2. [AUTHENTICATION.md](AUTHENTICATION.md) - Entenda fluxo de login
3. [ERROR-HANDLING.md](ERROR-HANDLING.md) - Trate erros corretamente

### "Preciso adicionar uma nova permissão"

1. [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md) - Como funciona RBAC
2. [DATABASE.md](DATABASE.md) - Veja schema de Access
3. [SERVICES.md](SERVICES.md) - Implemente validação

### "Preciso fazer deploy"

1. [DEPLOYMENT.md](DEPLOYMENT.md) - Setup de Docker/Compose
2. [DATABASE.md](DATABASE.md) - Configuração de banco
3. [TESTING.md](TESTING.md) - Valide antes de deploy

### "Preciso debugar um erro"

1. [ERROR-HANDLING.md](ERROR-HANDLING.md) - Entenda o erro
2. [DEPLOYMENT.md](DEPLOYMENT.md) - Veja logs
3. [ENDPOINTS.md](ENDPOINTS.md) - Verifique request/response

---

## 📊 Arquivos Existentes (Referência)

Estes arquivos já existiam e foram expandidos:

```
docs/project/api/
├── database-schema.md      ✅ Schema de tabelas
├── database-seed.md        ✅ Estratégia de seed
└── ... (arquivos novos criados abaixo)
```

---

## 📄 Estrutura Completa de Documentação

```
docs/project/api/
├── README.md                          ⭐ Comece aqui
├── INDEX.md                           👈 Você está aqui
│
├── 🏗️ ARQUITETURA
├── ARCHITECTURE.md                    Camadas, fluxo, integração
│
├── 🔐 SEGURANÇA & AUTENTICAÇÃO
├── AUTHENTICATION.md                  Login, OTP, reset, logout
├── AUTHORIZATION-RBAC.md              Permissões, controle de acesso
│
├── 📡 API
├── ENDPOINTS.md                       Todos os 16 endpoints
├── ERROR-HANDLING.md                  Códigos HTTP, tratamento
│
├── 📦 DADOS
├── MODELS.md                          Entidades e DTOs
├── DATABASE.md                        Schema, migrações, queries
├── database-schema.md                 (existente) Definição de tabelas
├── database-seed.md                   (existente) Seed strategy
│
├── ⚙️ IMPLEMENTAÇÃO
├── SERVICES.md                        Services, DI, lógica de negócio
├── TESTING.md                         Unit tests, E2E
├── DEPLOYMENT.md                      Docker, Compose, deploy
```

---

## 🔗 Dependências Entre Documentos

```
README.md
├─→ ARCHITECTURE.md
│   ├─→ ENDPOINTS.md
│   │   ├─→ ERROR-HANDLING.md
│   │   └─→ AUTHENTICATION.md
│   │       └─→ AUTHORIZATION-RBAC.md
│   │
│   ├─→ MODELS.md
│   │   └─→ DATABASE.md
│   │       ├─→ database-schema.md
│   │       └─→ database-seed.md
│   │
│   └─→ SERVICES.md
│       ├─→ AUTHENTICATION.md
│       ├─→ MODELS.md
│       └─→ DATABASE.md
│
├─→ TESTING.md
│   ├─→ ENDPOINTS.md
│   └─→ DEPLOYMENT.md
│
└─→ DEPLOYMENT.md
    ├─→ DATABASE.md
    └─→ TESTING.md
```

---

## 🎓 Roteiros de Aprendizado

### Roteiro 1: Iniciante (2-3 horas)

```
1. README.md              (15 min)  - Overview
2. ARCHITECTURE.md        (30 min)  - Estrutura
3. ENDPOINTS.md          (45 min)  - APIs disponíveis
4. AUTHENTICATION.md     (45 min)  - Fluxos de auth
5. DEPLOYMENT.md         (30 min)  - Como rodar
```

**Resultado**: Entender a API e conseguir integrar ao frontend

---

### Roteiro 2: Intermediário (1 dia)

```
1. Completar Roteiro 1
2. MODELS.md             (30 min)  - Estruturas de dados
3. DATABASE.md           (45 min)  - Banco de dados
4. AUTHORIZATION-RBAC.md (45 min)  - Sistema de permissões
5. SERVICES.md           (45 min)  - Implementação interna
6. TESTING.md            (30 min)  - Como testar
```

**Resultado**: Conseguir adicionar novos features / endpoints

---

### Roteiro 3: Avançado (2-3 dias)

```
1. Completar Roteiro 2
2. ERROR-HANDLING.md     (30 min)  - Tratamento robusto
3. database-schema.md    (30 min)  - Detalhes de schema
4. database-seed.md      (30 min)  - Idempotência e seed
5. Prática: Adicionar novo endpoint
6. Prática: Escrever testes
7. Prática: Deploy em novo ambiente
```

**Resultado**: Ser capaz de manter e evoluir a API

---

## 🔍 Busca por Tópico

### Por que preciso de...

- **Autenticação?** → [AUTHENTICATION.md](AUTHENTICATION.md)
- **Autorização?** → [AUTHORIZATION-RBAC.md](AUTHORIZATION-RBAC.md)
- **Conectar ao banco?** → [DATABASE.md](DATABASE.md)
- **Entender estrutura?** → [MODELS.md](MODELS.md)
- **Chamar um endpoint?** → [ENDPOINTS.md](ENDPOINTS.md)
- **Tratar erros?** → [ERROR-HANDLING.md](ERROR-HANDLING.md)
- **Testar?** → [TESTING.md](TESTING.md)
- **Fazer deploy?** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Cache?** → [SERVICES.md](SERVICES.md) (CacheService)
- **Email?** → [SERVICES.md](SERVICES.md) (EmailService)

---

## 📋 Convenções de Documentação

### Estrutura Padrão de Cada Arquivo

Cada arquivo de documentação segue este padrão:

```markdown
# Título Principal

## 📋 Seção Inicial

Visão geral do tópico

## 🔄 Fluxos/Conceitos Principais

Diagramas, tabelas, exemplos

## 💻 Código

Exemplos de implementação

## 📊 Tabelas de Referência

Data structures, endpoints, erros

## 🔗 Documentação Relacionada

Links para arquivos correlatos

---

**Próximos passos?** 👉 Link para próximo documento
```

### Ícones Usados

| Ícone | Significado                     |
| ----- | ------------------------------- |
| 📋    | Documentação, resumo            |
| 🔐    | Segurança, autenticação         |
| 🔑    | Chaves, permissões, autorização |
| 💾    | Dados, banco, persistência      |
| 📡    | API, endpoints, requisições     |
| 🏗️    | Arquitetura, design             |
| ⚙️    | Configuração, setup             |
| 🧪    | Testes                          |
| 🐳    | Docker, containers              |
| 🔄    | Fluxos, processos               |
| ✅    | Bom, recomendado                |
| ❌    | Ruim, não recomendado           |
| ⚠️    | Atenção, importante             |
| 🎯    | Objetivo, meta                  |

---

## 🚀 Como Contribuir

Ao adicionar nova documentação:

1. **Siga o padrão** (seções, ícones, links)
2. **Adicione exemplos práticos** (código, curl, requests)
3. **Cross-reference** outros arquivos relacionados
4. **Mantenha atualizado** quando mudar código
5. **Atualize este INDEX.md** com novo tópico

---

## 📞 Suporte

- **Dúvidas técnicas?** → Verifique [ENDPOINTS.md](ENDPOINTS.md)
- **Erro na integração?** → Consulte [ERROR-HANDLING.md](ERROR-HANDLING.md)
- **Problemas com deploy?** → Leia [DEPLOYMENT.md](DEPLOYMENT.md)
- **Schema não faz sentido?** → Veja [DATABASE.md](DATABASE.md)

---

## 📝 Status da Documentação

| Arquivo               | Status       | Última Atualização |
| --------------------- | ------------ | ------------------ |
| README.md             | ✅ Completo  | Abril 2026         |
| INDEX.md              | ✅ Completo  | Abril 2026         |
| ARCHITECTURE.md       | ✅ Completo  | Abril 2026         |
| AUTHENTICATION.md     | ✅ Completo  | Abril 2026         |
| AUTHORIZATION-RBAC.md | ✅ Completo  | Abril 2026         |
| ENDPOINTS.md          | ✅ Completo  | Abril 2026         |
| ERROR-HANDLING.md     | ✅ Completo  | Abril 2026         |
| MODELS.md             | ✅ Completo  | Abril 2026         |
| SERVICES.md           | ✅ Completo  | Abril 2026         |
| DATABASE.md           | ✅ Completo  | Abril 2026         |
| TESTING.md            | ✅ Completo  | Abril 2026         |
| DEPLOYMENT.md         | ✅ Completo  | Abril 2026         |
| database-schema.md    | ✅ Existente | -                  |
| database-seed.md      | ✅ Existente | -                  |

---

**📚 Documentação Completa da DAINAI API**

_v1.0 - Abril 2026_
