using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Application.Utils;
using Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ICacheService _cache;
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;

        public AdminService(
            UserManager<User> userManager,
            AppDbContext context,
            IEmailService emailService,
            ICacheService cache,
            IFileService fileService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
            _cache = cache;
            _fileService = fileService;
            _configuration = configuration;
        }

        public async Task<ApiResponse<List<ProfileResponse>>> GetProfilesAsync()
        {
            var profiles = await _context.Profiles.Include(p => p.User).ToListAsync();
            var response = profiles.Select(p => new ProfileResponse(p.Id, p.Name, p.AvatarUrl, p.User.Email!, p.IsActive)).ToList();
            return new ApiResponse<List<ProfileResponse>>("200", "", response);
        }

        public async Task<ApiResponse<ProfileResponse>> CreateProfileAsync(CreateProfileRequest request)
        {
            // 1. Generate temporary password and invitation token
            var password = PasswordGenerator.Generate();
            var inviteToken = Guid.NewGuid().ToString("N");

            // 2. Create Identity User
            var user = new User { UserName = request.Email, Email = request.Email, EmailConfirmed = true };
            var result = await _userManager.CreateAsync(user, password);

            if (!result.Succeeded)
                return new ApiResponse<ProfileResponse>("400", "Erro ao criar usuário", null);

            // 3. Create Profile (Automatic)
            var profile = new Profile
            {
                Id = user.Id, // Linking Profile ID to User ID
                UserId = user.Id,
                Name = request.Name,
                IsActive = true
            };
            _context.Profiles.Add(profile);

            // 4. Link Team and Position
            var profileTeam = new ProfileTeam
            {
                ProfileId = profile.Id,
                TeamId = request.TeamId,
                PositionId = request.PositionId
            };
            _context.ProfileTeams.Add(profileTeam);

            await _context.SaveChangesAsync();

            // 5. Store invitation context and notify user without exposing a password
            await _cache.SetAsync($"invite_{user.Id}", inviteToken, TimeSpan.FromHours(24));
            var inviteBaseUrl = _configuration["App:InvitationBaseUrl"] ?? "http://localhost:3000/auth/reset-password";
            var inviteLink = $"{inviteBaseUrl}?token={inviteToken}&email={Uri.EscapeDataString(request.Email)}";
            await _emailService.SendInvitationEmailAsync(request.Email, inviteLink);

            return new ApiResponse<ProfileResponse>("201", "Usuario criado com sucesso",
                new ProfileResponse(profile.Id, profile.Name, null, user.Email, true));
        }

        public async Task<ApiResponse<object>> ToggleProfileActiveAsync(Guid id)
        {
            var profile = await _context.Profiles.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
            if (profile == null) return new ApiResponse<object>("404", "Perfil não encontrado", null);

            profile.IsActive = !profile.IsActive;
            await _context.SaveChangesAsync();

            await _cache.RemoveAsync($"rbac_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v2_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v3_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v4_{profile.UserId}");

            if (profile.User != null)
            {
                await _userManager.UpdateSecurityStampAsync(profile.User);
            }
            return new ApiResponse<object>("200", $"Perfil {(profile.IsActive ? "ativado" : "desativado")} com sucesso", null);
        }

        public async Task<ApiResponse<AccessControlResponse>> GetAccessControlAsync()
        {
            var positions = await _context.Positions.Include(p => p.Accesses).ToListAsync();
            var depts = await _context.Departments.ToListAsync();
            var perms = await _context.Permissions.ToListAsync();
            var screens = await _context.Screens.ToListAsync();

            var data = positions.Select(p => new PositionResponse(
                p.Id, p.Name, p.DepartmentId, p.IsActive,
                p.Accesses.Select(a => a.PermissionId).ToList()
            )).ToList();

            var response = new AccessControlResponse(
                data,
                depts.Select(d => new DepartmentDto(d.Id, d.Name)).ToList(),
                perms.Select(p => new PermissionDto(p.Id, p.Name, p.NameKey)).ToList(),
                screens.Select(s => new ScreenDto(s.Id, s.Name, s.NameSidebar, s.NameKey)).ToList()
            );

            return new ApiResponse<AccessControlResponse>("200", "", response);
        }

        public async Task<ApiResponse<PositionResponse>> CreatePositionAsync(Position record)
        {
            _context.Positions.Add(record);
            await _context.SaveChangesAsync();
            return new ApiResponse<PositionResponse>("201", "Cargo criado com sucesso", null);
        }

        public async Task<ApiResponse<object>> DeletePositionAsync(int id)
        {
            var pos = await _context.Positions.FindAsync(id);
            if (pos == null) return new ApiResponse<object>("404", "Cargo não encontrado", null);

            // Check if users are using this position
            var hasUsers = await _context.ProfileTeams.AnyAsync(pt => pt.PositionId == id);
            if (hasUsers) return new ApiResponse<object>("400", "Cargo possui usuários vinculados", null);

            _context.Positions.Remove(pos);
            await _context.SaveChangesAsync();
            return new ApiResponse<object>("200", "Cargo removido com sucesso", null);
        }

        public async Task<ApiResponse<List<TeamResponse>>> GetTeamsAsync()
        {
            var teams = await _context.Teams
                .Where(t => t.DeletedAt == null)
                .ToListAsync();
            var response = teams.Select(t => new TeamResponse(t.Id, t.Name, t.IconUrl, t.LogotipoUrl, t.IsActive)).ToList();
            return new ApiResponse<List<TeamResponse>>("200", "", response);
        }

        public async Task<ApiResponse<TeamResponse>> CreateTeamAsync(SaveTeamRequest request)
        {
            var team = new Team
            {
                Name = request.Name,
                IconUrl = request.IconUrl,
                LogotipoUrl = request.LogotipoUrl,
                IsActive = request.IsActive
            };
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            var response = new TeamResponse(team.Id, team.Name, team.IconUrl, team.LogotipoUrl, team.IsActive);
            return new ApiResponse<TeamResponse>("201", "Equipe criada com sucesso", response);
        }

        public async Task<ApiResponse<TeamResponse>> UpdateTeamAsync(Guid id, SaveTeamRequest request)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null) return new ApiResponse<TeamResponse>("404", "Equipe não encontrada", null);

            // File cleanup logic
            if (!string.IsNullOrEmpty(team.LogotipoUrl) && team.LogotipoUrl != request.LogotipoUrl)
            {
                _fileService.DeleteFile(team.LogotipoUrl);
            }

            if (!string.IsNullOrEmpty(team.IconUrl) && team.IconUrl != request.IconUrl)
            {
                _fileService.DeleteFile(team.IconUrl);
            }

            team.Name = request.Name;
            team.IconUrl = request.IconUrl;
            team.LogotipoUrl = request.LogotipoUrl;
            team.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            var response = new TeamResponse(team.Id, team.Name, team.IconUrl, team.LogotipoUrl, team.IsActive);
            return new ApiResponse<TeamResponse>("200", "Equipe atualizada com sucesso", response);
        }

        public async Task<ApiResponse<object>> DeleteTeamAsync(Guid id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null) return new ApiResponse<object>("404", "Equipe não encontrada", null);

            var hasProfiles = await _context.ProfileTeams.AnyAsync(pt => pt.TeamId == id);
            if (hasProfiles) return new ApiResponse<object>("400", "Equipe possui usuários vinculados", null);

            team.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return new ApiResponse<object>("200", "Equipe removida com sucesso", null);
        }

        public async Task<ApiResponse<List<ScreenResponse>>> GetScreensAsync()
        {
            var screens = await _context.Screens.ToListAsync();
            var response = screens.Select(s => new ScreenResponse(s.Id, s.Name, s.NameSidebar, s.NameKey)).ToList();
            return new ApiResponse<List<ScreenResponse>>("200", "", response);
        }

        public async Task<ApiResponse<ScreenResponse>> UpdateScreenAsync(int id, ScreenResponse request)
        {
            var screen = await _context.Screens.FindAsync(id);
            if (screen == null) return new ApiResponse<ScreenResponse>("404", "Tela não encontrada", null);

            // Business Rule: name_key is immutable
            if (screen.NameKey != request.NameKey)
                return new ApiResponse<ScreenResponse>("400", "Não é permitido alterar o name_key da tela", null);

            screen.Name = request.Name;
            screen.NameSidebar = request.NameSidebar;
            await _context.SaveChangesAsync();

            return new ApiResponse<ScreenResponse>("200", "Tela atualizada com sucesso", null);
        }
    }
}
