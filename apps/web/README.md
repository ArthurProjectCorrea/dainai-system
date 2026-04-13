# Web App (Next.js)

Aplicacao web em Next.js App Router para o sistema Dainai.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript strict
- Server Actions para fluxo de autenticacao
- Middleware/Proxy (`proxy.ts`) para protecao de rotas e integracao com API

## Modulo Auth (implementado)

Fluxo entregue sem alterar a UI existente:

1. Login (`/auth/login`)
2. Forgot password (`/auth/forgot-password`)
3. Verify OTP (`/auth/verify-otp`)
4. Reset password (`/auth/reset-password`)
5. Logout

### Componentes utilizados

Ja existentes e reaproveitados:

- `components/form/login-form.tsx`
- `components/form/forgot-password-form.tsx`
- `components/form/verify-otp-form.tsx`
- `components/form/reset-password-form.tsx`
- `components/providers/auth-provider.tsx`

Nenhum novo componente de UI foi necessario para concluir o modulo auth.

## Variaveis de ambiente

Arquivo: `.env.local`

```env
BACKEND_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Requisitos da API para funcionar com o Web

1. CORS habilitado com credenciais para `http://localhost:3000`
2. API rodando em `http://localhost:5000`
3. Cookie auth ativo no backend (`AuthToken`)

Configuracao de CORS na API foi aplicada em:

- `apps/api/Api.Web/Program.cs`
- origem configuravel via `App__WebClientUrl` (default `http://localhost:3000`)

## Como rodar local

No root do monorepo:

```bash
docker compose up -d db redis mailhog api
```

No web:

```bash
cd apps/web
npm install
npm run dev
```

Abrir:

- Web: `http://localhost:3000`
- API Swagger: `http://localhost:5000/swagger`
- Mailhog: `http://localhost:8025`

## Testes manuais do modulo auth

1. Login
   - Ir para `/auth/login`
   - Usar usuario seed: `admin@empresa.com` / `Admin123!`
   - Esperado: redireciona para `/{client}/dashboard`

2. Sessao
   - `GET /api/v1/auth/me` no web deve retornar 200 apos login

3. Forgot password
   - Solicitar codigo em `/auth/forgot-password`
   - Verificar email no Mailhog

4. Verify OTP
   - Inserir codigo em `/auth/verify-otp`
   - Esperado: vai para reset com token

5. Reset password
   - Redefinir senha em `/auth/reset-password`
   - Esperado: retorno para login com mensagem de sucesso

6. Logout
   - Acionar logout no menu do usuario
   - Esperado: volta para `/auth/login`

## Validacao executada

- `npm run lint` (sem erros, apenas warnings nao relacionados ao auth)
- `docker compose build api`
- `docker compose up -d api`
- CORS preflight validado (`Access-Control-Allow-Origin` e `Allow-Credentials`)
- Login + `/auth/me` validados na API com sessao HTTP

## Observacoes de seguranca

- Sem armazenamento de senha/token em localStorage
- Sessao principal baseada em cookie do backend
- Rota privada protegida no `proxy.ts`
- Multi-tenant validado por `client_domain`
