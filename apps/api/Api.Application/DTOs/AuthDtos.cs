using System;
using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record ApiResponse<T>(string Code, string Message, T? Data);

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(Guid UserId, string Email, string Name);

    public record VerifyOtpResponse(string ResetToken, int ExpiresInMinutes);

    public record ProfileResponse(Guid Id, string Name, string? AvatarUrl, string Email, bool IsActive);

    public record PermissionDto(int Id, string Name, string NameKey);
    public record ScreenDto(int Id, string Name, string NameSidebar, string NameKey);

    public record AccessDto(string NameKey, string NameSidebar, List<string> Permissions);

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

    public record UserTeamDto(Guid Id, string Name, string? LogotipoUrl);

    public record ForgotPasswordRequest(string Email);
    public record VerifyOtpRequest(string Email, string Code);
    public record ResetPasswordRequest(string NewPassword, string ConfirmPassword);
}
