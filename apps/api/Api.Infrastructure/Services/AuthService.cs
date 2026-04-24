using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly AppDbContext _context;
        private readonly ICacheService _cache;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            AppDbContext context,
            ICacheService cache,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _cache = cache;
            _emailService = emailService;
        }

        public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null) return new ApiResponse<LoginResponse>("401", "E-mail ou senha inválidos.", null);

            // Verificação de Lockout antes mesmo de tentar a senha
            if (await _userManager.IsLockedOutAsync(user))
            {
                return new ApiResponse<LoginResponse>("401", "Muitas tentativas falhas. Conta bloqueada temporariamente.", null);
            }

            var profile = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Team)
                .FirstOrDefaultAsync(p => p.UserId == user.Id);

            if (profile != null)
            {
                if (!profile.IsActive)
                    return new ApiResponse<LoginResponse>("401", "E-mail ou senha inválidos.", null);

                if (profile.ProfileTeams.Count == 1 && !profile.ProfileTeams.First().Team.IsActive)
                {
                    return new ApiResponse<LoginResponse>("403", "Sua equipe está inativa. Entre em contato com o administrador.", null);
                }
            }

            // Ativado lockoutOnFailure: true
            var result = await _signInManager.PasswordSignInAsync(user, request.Password, isPersistent: false, lockoutOnFailure: true);

            if (result.IsLockedOut)
                return new ApiResponse<LoginResponse>("401", "Muitas tentativas falhas. Conta bloqueada temporariamente.", null);

            if (!result.Succeeded)
                return new ApiResponse<LoginResponse>("401", "E-mail ou senha inválidos.", null);

            // Invalidação de cache de permissões (apenas a versão atual)
            await _cache.RemoveAsync($"rbac_v4_{user.Id}");

            return new ApiResponse<LoginResponse>("200", "Login realizado com sucesso",
                new LoginResponse(user.Id, user.Email!, profile?.Name ?? "Usuário"));
        }

        public async Task LogoutAsync()
        {
            var user = _signInManager.Context?.User;
            var userId = user?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(userId, out var parsedUserId))
            {
                await _cache.RemoveAsync($"rbac_v4_{parsedUserId}");
                await _cache.RemoveAsync($"rbac_v3_{parsedUserId}");
                await _cache.RemoveAsync($"rbac_v2_{parsedUserId}");
                await _cache.RemoveAsync($"rbac_{parsedUserId}");
            }

            await _signInManager.SignOutAsync();
        }

        public async Task<ApiResponse<UserMeResponse>> GetMeAsync(Guid userId)
        {
            // Try to get from cache first
            var cacheKey = $"rbac_v4_{userId}";
            var cachedData = await _cache.GetAsync<UserMeResponse>(cacheKey);
            if (cachedData != null) return new ApiResponse<UserMeResponse>("200", "", cachedData);

            // Fetch from DB
            var profile = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Team)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Department)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Accesses)
                            .ThenInclude(a => a.Screen)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Accesses)
                            .ThenInclude(a => a.Permission)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null) return new ApiResponse<UserMeResponse>("404", "Perfil não encontrado", null);
            if (!profile.IsActive) return new ApiResponse<UserMeResponse>("401", "Sessão inválida ou expirada", null);

            // Countermeasure: check if user has only 1 team and it's inactive
            if (profile.ProfileTeams.Count == 1 && !profile.ProfileTeams.First().Team.IsActive)
            {
                return new ApiResponse<UserMeResponse>("403", "Sua equipe está inativa. Entre em contato com o administrador.", null);
            }

            var teamAccesses = profile.ProfileTeams
                .Select(pt => new TeamAccessDto(
                    pt.Team.Id,
                    pt.Position.Name,
                    pt.Position.Department?.Name ?? "N/A",
                    BuildAccesses(pt.Position.Accesses)
                ))
                .ToList();

            var response = new UserMeResponse(
                new ProfileResponse(profile.Id, profile.Name, profile.AvatarUrl, profile.User.Email!, profile.IsActive),
                profile.ProfileTeams.Select(pt => new UserTeamDto(
                    pt.Team.Id,
                    pt.Team.Name,
                    pt.Team.IsActive
                )).ToList(),
                teamAccesses
            );

            await _cache.SetAsync(cacheKey, response, TimeSpan.FromHours(1));
            return new ApiResponse<UserMeResponse>("200", "", response);
        }

        public async Task<ApiResponse<object>> ForgotPasswordAsync(string email)
        {
            var attempt = await _context.OtpAttempts.FirstOrDefaultAsync(x => x.Email == email);
            if (attempt != null && attempt.IsBlocked)
            {
                return new ApiResponse<object>("429", "Muitas tentativas. Tente novamente em alguns minutos.", null);
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user != null)
            {
                var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                var tokenKey = $"otp_{email}";
                await _cache.SetAsync(tokenKey, HashValue(otp), TimeSpan.FromMinutes(10));
                if (attempt == null)
                {
                    attempt = new OtpAttempt { Email = email, AttemptCount = 0, IsBlocked = false };
                    _context.OtpAttempts.Add(attempt);
                }
                attempt.LastAttempt = DateTime.UtcNow;
                attempt.IsBlocked = false;
                await _context.SaveChangesAsync();
                await _emailService.SendOtpAsync(email, otp);
            }
            return new ApiResponse<object>("200", "Se o e-mail estiver cadastrado, você receberá um código de verificação.", null);
        }

        public async Task<ApiResponse<VerifyOtpResponse>> VerifyOtpAsync(VerifyOtpRequest request)
        {
            var tokenKey = $"otp_{request.Email}";
            var cachedOtp = await _cache.GetAsync<string>(tokenKey);
            var attempt = await _context.OtpAttempts.FirstOrDefaultAsync(x => x.Email == request.Email);

            if (attempt != null && attempt.IsBlocked)
            {
                return new ApiResponse<VerifyOtpResponse>("429", "Limite de tentativas excedido", null);
            }

            if (cachedOtp == null || cachedOtp != HashValue(request.Code))
            {
                if (attempt == null)
                {
                    attempt = new OtpAttempt { Email = request.Email, AttemptCount = 1, IsBlocked = false, LastAttempt = DateTime.UtcNow };
                    _context.OtpAttempts.Add(attempt);
                }
                else
                {
                    attempt.AttemptCount += 1;
                    attempt.LastAttempt = DateTime.UtcNow;
                    attempt.IsBlocked = attempt.AttemptCount >= 5;
                }
                await _context.SaveChangesAsync();
                return new ApiResponse<VerifyOtpResponse>("400", "Código inválido ou expirado", null);
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return new ApiResponse<VerifyOtpResponse>("400", "Código inválido ou expirado", null);
            }

            var resetToken = Guid.NewGuid().ToString();
            await _cache.SetAsync($"reset_{resetToken}", user.Id.ToString(), TimeSpan.FromMinutes(10));
            await _cache.RemoveAsync(tokenKey);

            if (attempt != null)
            {
                attempt.AttemptCount = 0;
                attempt.IsBlocked = false;
                attempt.LastAttempt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return new ApiResponse<VerifyOtpResponse>("200", "Código verificado com sucesso.", new VerifyOtpResponse(resetToken, 10));
        }

        public async Task<ApiResponse<object>> ResetPasswordAsync(string resetToken, string newPassword)
        {
            var userId = await _cache.GetAsync<string>($"reset_{resetToken}");
            if (string.IsNullOrWhiteSpace(userId)) return new ApiResponse<object>("401", "Contexto de reset inválido ou expirado", null);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return new ApiResponse<object>("401", "Contexto de reset inválido ou expirado", null);

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded) return new ApiResponse<object>("400", "Falha ao resetar senha", result.Errors);

            await _userManager.UpdateSecurityStampAsync(user);
            await _cache.RemoveAsync($"rbac_{user.Id}");
            await _cache.RemoveAsync($"rbac_v2_{user.Id}");
            await _cache.RemoveAsync($"rbac_v3_{user.Id}");
            await _cache.RemoveAsync($"rbac_v4_{user.Id}");
            await _cache.RemoveAsync($"reset_{resetToken}");
            var attempt = await _context.OtpAttempts.FirstOrDefaultAsync(x => x.Email == user.Email);
            if (attempt != null)
            {
                _context.OtpAttempts.Remove(attempt);
                await _context.SaveChangesAsync();
            }
            return new ApiResponse<object>("200", "Senha alterada com sucesso.", null);
        }

        public async Task<bool> HasPermissionAsync(Guid userId, Guid? activeTeamId, string screen, string permission)
        {
            var meResponse = await GetMeAsync(userId);
            if (meResponse.Data == null) return false;

            var scopedAccesses = activeTeamId.HasValue
                ? meResponse.Data.TeamAccesses
                    .Where(t => t.TeamId == activeTeamId.Value)
                    .SelectMany(t => t.Accesses)
                : meResponse.Data.TeamAccesses.SelectMany(t => t.Accesses);

            return scopedAccesses.Any(a => a.NameKey == screen && a.Permissions.Contains(permission));
        }

        public async Task<string> GetScopeAsync(Guid userId, Guid? activeTeamId, string screen)
        {
            var meResponse = await GetMeAsync(userId);
            if (meResponse.Data == null) return "team";

            var scopedAccesses = activeTeamId.HasValue
                ? meResponse.Data.TeamAccesses
                    .Where(t => t.TeamId == activeTeamId.Value)
                    .SelectMany(t => t.Accesses)
                : meResponse.Data.TeamAccesses.SelectMany(t => t.Accesses);

            var access = scopedAccesses.FirstOrDefault(a => a.NameKey == screen);
            return access?.Scope ?? "team";
        }

        private static string HashValue(string value)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(value));
            return Convert.ToHexString(bytes);
        }

        private static List<AccessDto> BuildAccesses(IEnumerable<Access> accesses)
        {
            return accesses
                .GroupBy(a => a.Screen.NameKey)
                .Select(g => new AccessDto(
                    g.Key,
                    g.Select(a => a.Screen.Name).FirstOrDefault() ?? g.Key,
                    g.Select(a => a.Screen.NameSidebar).FirstOrDefault() ?? g.Key,
                    g.Select(a => a.Permission.NameKey).Distinct().ToList(),
                    g.Select(a => a.Scope).FirstOrDefault() ?? "team"
                ))
                .ToList();
        }
    }
}
