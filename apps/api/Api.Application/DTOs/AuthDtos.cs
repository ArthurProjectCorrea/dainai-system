using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Application.DTOs
{
    public record ApiResponse<T>(string Code, string Message, T? Data);

    public record LoginRequest(
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email,

        [Required(ErrorMessage = "A senha é obrigatória")]
        string Password
    );
    public record LoginResponse(Guid UserId, string Email, string Name);

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

    public record UserTeamDto(Guid Id, string Name, string? LogotipoUrl, bool IsActive);

    public record ForgotPasswordRequest(
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email
    );
    public record VerifyOtpRequest(
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email,

        [Required(ErrorMessage = "O código é obrigatório")]
        string Code
    );
    public record ResetPasswordRequest(
        [Required(ErrorMessage = "A nova senha é obrigatória")]
        [MinLength(8, ErrorMessage = "A senha deve ter ao menos 8 caracteres")]
        string NewPassword,

        [Required(ErrorMessage = "A confirmação de senha é obrigatória")]
        string ConfirmPassword
    );
}
