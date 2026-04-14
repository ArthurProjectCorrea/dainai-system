# Deployment e Infraestrutura

## 🐳 Docker Compose

### Visão Geral

A stack é orquestrada por um único `docker-compose.yml` na raiz do monorepo:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - '5000:8080'
    env_file:
      - ./apps/api/.env
    depends_on:
      - db
      - redis
      - mailhog
    environment:
      ASPNETCORE_ENVIRONMENT: Development
    networks:
      - dainai-network

  db:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    env_file:
      - ./apps/api/.env
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - dainai-network

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    networks:
      - dainai-network

  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - '1025:1025' # SMTP
      - '8025:8025' # Web UI
    networks:
      - dainai-network

volumes:
  pgdata:

networks:
  dainai-network:
    driver: bridge
```

---

## 🔧 Variáveis de Ambiente

### .env (Não Versionado)

Armazenado em `apps/api/.env` e linkado via `env_file` no compose:

```env
# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080

# Database (PostgreSQL)
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dainaidb
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=dainaidb;Username=user;Password=password

# Seed automático
SeedDatabase=true

# Cache (Redis) - Opcional
Redis__ConnectionString=redis:6379

# Email (SMTP via Mailhog)
Smtp__Host=mailhog
Smtp__Port=1025
Smtp__SenderEmail=noreply@dainai.local
Smtp__SenderName=Dainai

# URLs (para convites, etc)
Urls__InviteLink=http://localhost:3000/reset-password?email={email}
Urls__ResetLink=http://localhost:3000/reset-password?token={token}
```

### .env.example (Versionado)

Arquivo template com placeholders para documentação:

```env
# Copie este arquivo para .env e preencha os valores
ASPNETCORE_ENVIRONMENT=Development
POSTGRES_USER=user
POSTGRES_PASSWORD=change_me  # Altere em produção
POSTGRES_DB=dainaidb
SeedDatabase=true
Redis__ConnectionString=redis:6379
Smtp__Host=mailhog
Smtp__Port=1025
Smtp__SenderEmail=noreply@dainai.local
Urls__InviteLink=https://app.example.com/reset?email={email}
```

---

## 🏗️ Dockerfile

```dockerfile
# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia projeto
COPY ["Api.Web/Api.Web.csproj", "Api.Web/"]
COPY ["Api.Application/Api.Application.csproj", "Api.Application/"]
COPY ["Api.Infrastructure/Api.Infrastructure.csproj", "Api.Infrastructure/"]
COPY ["Api.Domain/Api.Domain.csproj", "Api.Domain/"]
COPY ["Api.Tests/Api.Tests.csproj", "Api.Tests/"]

# Restaura dependências
RUN dotnet restore "Api.Web/Api.Web.csproj"

# Copia todo o código
COPY . .

# Build em Release
RUN dotnet build "Api.Web/Api.Web.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Api.Web/Api.Web.csproj" -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copia binários publicados
COPY --from=publish /app/publish .

# Cria usuário não-root por segurança
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

# Porta e URL
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Api.Web.dll"]
```

**Otimizações**:

- ✅ Multi-stage reduz tamanho final (~250MB → ~100MB)
- ✅ User não-root aumenta segurança
- ✅ .dockerignore filtra arquivos desnecessários

---

## 📋 .dockerignore

```
bin
obj
.vs
.vscode
.git
.gitignore
*.md
*.user
.DS_Store
TestResults
docker-compose.yml
Dockerfile
.dockerignore
.env
.env.example
```

---

## 🚀 Iniciando a Stack

### Primeiro Build

```bash
# Build da imagem
docker compose build api

# Saída esperada:
# [+] Building 45.3s
# => [api] => build
# ...
# => exporting to image
# => => naming to dainai-system-api:latest
```

### Levantar Serviços

```bash
# Levantar em background
docker compose up -d

# Levantar com logs visíveis
docker compose up

# Saída esperada:
# Creating pgdata volume...
# Creating dainai-system_db_1
# Creating dainai-system_redis_1
# Creating dainai-system_mailhog_1
# Creating dainai-system_api_1
```

### Verificar Status

```bash
# Status dos containers
docker compose ps

# Output:
# NAME                      COMMAND                  SERVICE             STATUS
# dainai-system-api-1       "dotnet Api.Web.dll"     api                 Up 2m
# dainai-system-db-1        "docker-entrypoint..."   db                  Up 2m (healthy)
# dainai-system-redis-1     "redis-server"           redis               Up 2m
# dainai-system-mailhog-1   "MailHog"                mailhog             Up 2m
```

---

## 🔍 Debugging

### Logs

```bash
# Todos os logs
docker compose logs

# Apenas API
docker compose logs api

# Follow (em tempo real)
docker compose logs -f api

# Últimas 100 linhas
docker compose logs --tail 100 api

# Desde 30 minutos atrás
docker compose logs --since 30m api
```

### Conectar ao Container

```bash
# Executar comando
docker compose exec api bash

# Dentro do container, testar conectividade
ping db        # PostgreSQL
ping redis     # Cache
ping mailhog   # Email
```

### Conectar ao PostgreSQL

```bash
# Acessar cliente SQL
docker compose exec db psql -U user -d dainaidb

# Dentro do psql:
dainaidb=# SELECT * FROM "Profiles";
dainaidb=# SELECT * FROM "__EFMigrationsHistory";
dainaidb=# \dt                 # Listar tabelas
dainaidb=# \q                  # Sair
```

---

## 🧹 Cleanup

### Parar Serviços

```bash
# Parar sem remover
docker compose stop

# Parar e remover containers
docker compose down

# Remover também volumes (limpar dados)
docker compose down -v

# Remover também imagens
docker compose down --rmi all
```

---

## 📊 Monitoramento

### Health Checks (Futuro)

```yaml
# Adicionar em docker-compose.yml
api:
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:8080/health']
    interval: 10s
    timeout: 3s
    retries: 3
    start_period: 30s
```

### Verificar Recursos

```bash
# CPU e memória por container
docker stats

# Volume de disco
docker system df

# Remover dados não utilizados
docker system prune -a --volumes
```

---

## 🔐 Segurança

### Produção

```env
# ❌ DEV (Nunca em produção)
ASPNETCORE_ENVIRONMENT=Development
POSTGRES_PASSWORD=password

# ✅ PROD
ASPNETCORE_ENVIRONMENT=Production
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_USER=$(uuidgen)
```

### Secrets

Para ambientes sensíveis, usar Docker Secrets ou orchestradores:

```bash
# Docker Swarm
echo "secure_password" | docker secret create db_password -

# Kubernetes
kubectl create secret generic db-creds --from-literal=password=secure_password
```

---

## 📦 Otimizações

### Cache de Build

```dockerfile
# Antes (sem cache)
RUN dotnet restore
RUN dotnet build
RUN dotnet publish

# Depois (com cache das camadas)
COPY ["*.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build
RUN dotnet publish
```

### Multi-arch (futuro)

```bash
# Build para múltiplas arquiteturas
docker buildx build --platform linux/amd64,linux/arm64 -t myrepo/api:latest .
```

---

## 🌍 Ambientes

### Local

```yaml
# docker-compose.yml
ASPNETCORE_ENVIRONMENT: Development
SeedDatabase: true
Redis__ConnectionString: redis:6379
```

### Staging

```yaml
ASPNETCORE_ENVIRONMENT: Staging
SeedDatabase: false # Seed já aplicado
Redis__ConnectionString: redis-cluster:6379
```

### Production

```yaml
ASPNETCORE_ENVIRONMENT: Production
SeedDatabase: false
Redis__ConnectionString: redis-prod-1:6379,redis-prod-2:6379
```

---

## 📋 Stack de Deployments Recomendado

### Docker Compose (Desenvolvimento Local)

```
✅ Fácil setup
✅ Sem dependências externas
❌ Limitado a 1 máquina
❌ Sem HA (high availability)
```

### Docker Swarm (Produção Simples)

```
✅ Clustering nativo
✅ Load balancing automático
✅ Secrets gerenciadas
❌ Menos recursos que Kubernetes
```

### Kubernetes (Produção Escalável)

```
✅ Auto-scaling
✅ Self-healing
✅ Gerenciamento de recursos
❌ Mais complexo
```

---

## 📝 Scripts Úteis

---

## 🆕 Atualizacao Abril 2026

### Persistencia de uploads no docker-compose

O serviço `api` passou a usar volume para persistir arquivos enviados:

```yaml
api:
  volumes:
    - ./apps/api/wwwroot/uploads:/app/wwwroot/uploads
```

Isso garante que logotipos e imagens de equipes não sejam perdidos ao recriar o container.

### start.sh

```bash
#!/bin/bash

echo "🔨 Building API image..."
docker compose build api

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for services..."
sleep 10

echo "✅ Stack is ready!"
echo "API: http://localhost:5000"
echo "Swagger: http://localhost:5000/swagger"
echo "Mailhog: http://localhost:8025"
echo "PgAdmin (futuro): http://localhost:5050"
```

### reset-db.sh

```bash
#!/bin/bash

echo "🔄 Resetting database..."
docker compose down -v
docker compose up -d db

echo "⏳ Waiting for database..."
sleep 5

echo "🌱 Rebuilding API and seeding..."
docker compose restart api

echo "✅ Database reset complete!"
```

---

## 🔗 Documentação Relacionada

- [DATABASE.md](DATABASE.md) - Configuração de banco
- [TESTING.md](TESTING.md) - Testes com Docker
- [README.md](README.md) - Quick start

---

## 📞 Troubleshooting

### API não sobe

```bash
# 1. Verificar logs
docker compose logs api

# 2. Verificar conectividade com DB
docker compose exec api bash
# Dentro: ping db

# 3. Verificar migrações
docker compose logs db | grep migrate
```

### Porta em uso

```bash
# Encontrar PID
lsof -i :5000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
docker compose -f docker-compose.yml -p myport up -d
```

### Dados não persistem

```bash
# Verificar volume
docker volume ls
docker volume inspect pgdata

# Limpar volume
docker compose down -v
docker compose up -d
```

---

**Status**: ✅ Pronto para produção (com ajustes de segurança)

---

**Próximos passos?** 👉 Retorne a [README.md](README.md) para overview completo.
