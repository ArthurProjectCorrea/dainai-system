# Especificação Técnica Unificada: Autenticação e Segurança (Auth)

**Módulo Referência:** [auth.md](../auth.md)
**Responsável Técnico:** Antigravity
**Nível de Detalhe:** 3 (Ciclo Completo: Identidade, Sessão e Recuperação)
**Categorias:** Autenticação, Segurança, Identity

---

## 1. Visão Geral e Contexto
Este documento unifica os fluxos de acesso e proteção de identidade do sistema. A camada de autenticação utiliza o **ASP.NET Core Identity** estendido para suportar o modelo multi-tenant e multi-perfil da plataforma DAINAI, garantindo que o login inicial resolva todo o contexto de permissões (RBAC) do usuário.

## 2. Fluxo de Acesso (Login e Sessão)

### 2.1 Lógica de Login (`LoginAsync`)
1.  **Credenciais:** Validação padrão via `PasswordSignInAsync`.
2.  **Validação de Perfil:** Verifica se o perfil (`Profiles.IsActive`) está habilitado.
3.  **Contexto Organizacional:** Bloqueia o acesso se o único time do usuário estiver inativo.
4.  **RBAC Cache:** Invalida caches antigos no Redis para garantir que a nova sessão carregue as permissões mais recentes.

### 2.2 O Endpoint `/me`
* **Mecanismo:** Chamado em cada refresh de página/mudança de rota.
* **Cache:** Armazena o payload completo (Perfil + Times + Matriz de Acesso) no Redis por 1 hora.
* **Segurança:** Caso o perfil seja inativado por um administrador, o próximo hit no `/me` falhará, disparando o logout automático do usuário.

---

## 3. Fluxo de Recuperação de Senha (Self-Service)

### 3.1 Solicitação e OTP (`ForgotPassword`)
* **Anti-Abuso:** Utiliza a tabela `OtpAttempts` para bloquear e-mails com excesso de requisições.
* **OTP:** Gera um código de 6 dígitos (armazenado em Hash no Redis por 10 min) e envia via e-mail.

### 3.2 Verificação e Reset Context
* **Rate Limit:** Bloqueia o e-mail após 5 tentativas incorretas de OTP.
* **Contexto:** Em caso de sucesso, gera um `ResetToken` (GUID) enviado como cookie **HttpOnly** e armazenado no Redis para autorizar a mudança física da senha.

### 3.3 Redefinição (`ResetPassword`)
* **Identity Integration:** Consome o `ResetToken` para autorizar o `UserManager.ResetPasswordAsync`.
* **Segurança Crítica:** 
    * Atualiza o `SecurityStamp`, invalidando TODAS as sessões ativas do usuário em outros dispositivos.
    * Limpa todos os vestígios de OTP e tokens de reset.

---

## 4. Especificações de Interface (UI)
* **LoginForm:** Trata erros específicos de conta inativa (401) vs time inativo (403).
* **VerifyOtp:** Componente de alta usabilidade com auto-focus sequencial nos campos de dígitos.
* **ResetPassword:** Validação client-side de complexidade e confirmação de senha.

---

## 5. Persistência e Modelagem
* **Tabelas:** `AspNetUsers` (Credenciais), `Profiles` (Dados de Negócio), `OtpAttempts` (Segurança contra brute-force).
* **Cache Layer (Redis):** Gerencia a persistência de curta duração de tokens de sessão e recuperação, além da matriz de permissões.
