using Api.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
        Task LogoutAsync();
        Task<ApiResponse<UserMeResponse>> GetMeAsync(Guid userId);
        Task<ApiResponse<object>> ForgotPasswordAsync(string email);
        Task<ApiResponse<VerifyOtpResponse>> VerifyOtpAsync(VerifyOtpRequest request);
        Task<ApiResponse<object>> ResetPasswordAsync(string resetToken, string newPassword);
        Task<bool> HasPermissionAsync(Guid userId, Guid? activeTeamId, string screen, string permission);
        Task<string> GetScopeAsync(Guid userId, Guid? activeTeamId, string screen);
    }
}
