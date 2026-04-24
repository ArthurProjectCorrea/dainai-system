using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Application.DTOs
{
    /// <summary>
    /// Resposta padrão da API
    /// </summary>
    /// <typeparam name="T">Tipo do dado retornado</typeparam>
    /// <param name="Code">Código de status (ex: 200, 401, 400)</param>
    /// <param name="Message">Mensagem descritiva do resultado</param>
    /// <param name="Data">Dados do objeto de resposta (pode ser nulo em erros)</param>
    public record ApiResponse<T>(string Code, string Message, T? Data);

    /// <summary>
    /// Requisição de login
    /// </summary>
    /// <param name="Email">E-mail do usuário (ex: admin@empresa.com)</param>
    /// <param name="Password">Senha do usuário</param>
    public record LoginRequest(
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email,

        [Required(ErrorMessage = "A senha é obrigatória")]
        string Password
    );

    /// <summary>
    /// Dados do usuário após login bem-sucedido
    /// </summary>
    /// <param name="UserId">ID único do usuário</param>
    /// <param name="Email">E-mail do usuário</param>
    /// <param name="Name">Nome completo do usuário</param>
    public record LoginResponse(Guid UserId, string Email, string Name);

    /// <summary>
    /// Resposta da verificação de OTP contendo o token temporário de reset
    /// </summary>
    /// <param name="ResetToken">Token temporário para redefinição de senha</param>
    /// <param name="ExpiresInMinutes">Tempo de expiração do token em minutos</param>
    public record VerifyOtpResponse(string ResetToken, int ExpiresInMinutes);

    public record ProfileResponse(Guid Id, string Name, string? AvatarUrl, string Email, bool IsActive);

    public record PermissionDto(int Id, string Name, string NameKey);
    public record ScreenDto(int Id, string Name, string NameSidebar, string NameKey);

    public record AccessDto(string NameKey, string Name, string NameSidebar, List<string> Permissions, string Scope);

    public record TeamAccessDto(
        Guid TeamId,
        string Position,
        string Department,
        List<AccessDto> Accesses
    );

    public record UserMeResponse(
        ProfileResponse Profile,
        List<UserTeamDto> Teams,
        List<TeamAccessDto> TeamAccesses
    );

    public record UserTeamDto(Guid Id, string Name, bool IsActive);

    /// <summary>
    /// Solicitação de código para recuperação de senha
    /// </summary>
    /// <param name="Email">E-mail do usuário para onde o código será enviado</param>
    public record ForgotPasswordRequest(
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email
    );
    /// <summary>
    /// Verificação de código OTP
    /// </summary>
    /// <param name="Email">E-mail vinculado ao código</param>
    /// <param name="Code">Código de 6 dígitos enviado por e-mail</param>
    public record VerifyOtpRequest(
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email,

        [Required(ErrorMessage = "O código é obrigatório")]
        string Code
    );
    /// <summary>
    /// Definição de nova senha
    /// </summary>
    /// <param name="NewPassword">Nova senha desejada</param>
    /// <param name="ConfirmPassword">Confirmação da nova senha</param>
    public record ResetPasswordRequest(
        [Required(ErrorMessage = "A nova senha é obrigatória")]
        [MinLength(8, ErrorMessage = "A senha deve ter ao menos 8 caracteres")]
        string NewPassword,

        [Required(ErrorMessage = "A confirmação de senha é obrigatória")]
        string ConfirmPassword
    );
}
