# 🚀 Build e Deploy (Web)

## Variaveis de Ambiente

Obrigatorias para ambiente local/servidor:

```env
BACKEND_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Comandos

No diretorio `apps/web`:

```bash
npm install
npm run lint
npm run build
npm run start
```

## Checklist de Deploy

1. API acessivel pela URL configurada em `BACKEND_API_URL`.
2. CORS do backend liberando o dominio do frontend com credenciais.
3. Cookies de sessao funcionando no dominio final.
4. Rota `/api/*` sendo reescrita corretamente pelo proxy.
5. Build sem erros: `npm run build`.

## Docker

Existe `apps/web/Dockerfile` para empacotamento do frontend.
Use com o `docker-compose.yml` raiz conforme estrategia do ambiente.
