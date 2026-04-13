# ⚠️ Tratamento de Erros (Web)

## Estrategia

- Server actions retornam objetos simples: `{ success?: boolean, error?: string }`.
- Formularios exibem mensagens de erro no contexto da tela.
- Falhas de rede usam mensagens genericas para usuario final.

## Erros por Fluxo

### Login

- 401 -> "E-mail ou senha invalidos."
- outros codigos -> mensagem da API ou fallback "Erro ao realizar login."

### Forgot Password

- erro da API -> mensagem retornada no payload
- erro de rede -> "Erro de conexao com o servidor."

### Verify OTP

- codigo invalido/expirado -> "Codigo invalido."

### Reset Password

- senhas diferentes -> validacao local imediata
- token ausente -> erro local
- 401 -> "Codigo expirado. Solicite um novo."

## Erros de Sessao

No `AuthProvider`, se `/api/v1/auth/me` falhar:

- `user` vira `null`
- contexto de permissao fica vazio
- proxy passa a bloquear rotas privadas na proxima navegacao
