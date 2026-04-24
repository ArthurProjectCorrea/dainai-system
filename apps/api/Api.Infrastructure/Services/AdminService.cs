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

        public async Task<ApiResponse<UsersListResponse>> GetUsersAsync()
        {
            var profiles = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Team)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Department)
                .Where(p => p.DeletedAt == null)
                .OrderBy(p => p.Name)
                .ToListAsync();

            var users = profiles.Select(MapUser).ToList();
            var indicators = new UserManagementIndicatorsResponse(
                users.Count,
                users.Count(u => u.IsActive),
                users.Count(u => !u.IsActive)
            );

            var options = await BuildUserOptionsAsync();
            var payload = new UsersListResponse(users, indicators, options);

            return new ApiResponse<UsersListResponse>("200", "", payload);
        }

        public async Task<ApiResponse<UserDetailResponse>> GetUserByIdAsync(Guid id)
        {
            var profile = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Team)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Department)
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

            if (profile == null)
                return new ApiResponse<UserDetailResponse>("404", "Usuário não encontrado", null);

            var payload = new UserDetailResponse(MapUser(profile), await BuildUserOptionsAsync());
            return new ApiResponse<UserDetailResponse>("200", "", payload);
        }

        public async Task<ApiResponse<UserManagementUserResponse>> CreateUserAsync(SaveUserRequest request)
        {
            if (request.ProfileTeams == null || request.ProfileTeams.Count == 0)
                return new ApiResponse<UserManagementUserResponse>("400", "Informe ao menos uma atribuição de time e cargo", null);

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var existing = await _userManager.FindByEmailAsync(normalizedEmail);
            if (existing != null)
                return new ApiResponse<UserManagementUserResponse>("400", "Já existe um usuário com este e-mail", null);

            var assignments = request.ProfileTeams
                .Where(pt => pt.TeamId != Guid.Empty && pt.PositionId > 0)
                .GroupBy(pt => new { pt.TeamId, pt.PositionId })
                .Select(g => g.First())
                .ToList();

            if (assignments.Count == 0)
                return new ApiResponse<UserManagementUserResponse>("400", "As atribuições enviadas são inválidas", null);

            var teamIds = assignments.Select(a => a.TeamId).Distinct().ToList();
            var positionIds = assignments.Select(a => a.PositionId).Distinct().ToList();

            var validTeamIds = await _context.Teams
                .Where(t => t.DeletedAt == null && teamIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync();

            if (validTeamIds.Count != teamIds.Count)
                return new ApiResponse<UserManagementUserResponse>("400", "Uma ou mais equipes são inválidas", null);

            var validPositionIds = await _context.Positions
                .Where(p => positionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            if (validPositionIds.Count != positionIds.Count)
                return new ApiResponse<UserManagementUserResponse>("400", "Um ou mais cargos são inválidos", null);

            var password = PasswordGenerator.Generate();
            var inviteToken = Guid.NewGuid().ToString("N");

            var user = new User { UserName = normalizedEmail, Email = normalizedEmail, EmailConfirmed = true };
            var userResult = await _userManager.CreateAsync(user, password);
            if (!userResult.Succeeded)
                return new ApiResponse<UserManagementUserResponse>("400", "Erro ao criar usuário", null);

            var profile = new Profile
            {
                Id = user.Id,
                UserId = user.Id,
                Name = request.Name,
                AvatarUrl = request.AvatarUrl,
                IsActive = request.IsActive
            };
            _context.Profiles.Add(profile);

            foreach (var assignment in assignments)
            {
                _context.ProfileTeams.Add(new ProfileTeam
                {
                    ProfileId = profile.Id,
                    TeamId = assignment.TeamId,
                    PositionId = assignment.PositionId
                });
            }

            await _context.SaveChangesAsync();

            // Generate invitation token (7 days expiry)
            // Use 'reset_' prefix so AuthService.ResetPasswordAsync can consume it
            await _cache.SetAsync($"reset_{inviteToken}", user.Id.ToString(), TimeSpan.FromHours(168));
            var inviteBaseUrl = _configuration["App:InvitationBaseUrl"] ?? "http://localhost:3000/auth/reset-password";
            var inviteLink = $"{inviteBaseUrl}?token={inviteToken}&email={Uri.EscapeDataString(normalizedEmail)}";
            await _emailService.SendInvitationEmailAsync(normalizedEmail, inviteLink);

            var createdProfile = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Team)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Department)
                .FirstAsync(p => p.Id == profile.Id);

            return new ApiResponse<UserManagementUserResponse>("201", "Usuário criado com sucesso", MapUser(createdProfile));
        }

        public async Task<ApiResponse<UserManagementUserResponse>> UpdateUserAsync(Guid id, SaveUserRequest request)
        {
            var profile = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.ProfileTeams)
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

            if (profile == null)
                return new ApiResponse<UserManagementUserResponse>("404", "Usuário não encontrado", null);

            if (request.ProfileTeams == null || request.ProfileTeams.Count == 0)
                return new ApiResponse<UserManagementUserResponse>("400", "Informe ao menos uma atribuição de time e cargo", null);

            var assignments = request.ProfileTeams
                .Where(pt => pt.TeamId != Guid.Empty && pt.PositionId > 0)
                .GroupBy(pt => new { pt.TeamId, pt.PositionId })
                .Select(g => g.First())
                .ToList();

            if (assignments.Count == 0)
                return new ApiResponse<UserManagementUserResponse>("400", "As atribuições enviadas são inválidas", null);

            var teamIds = assignments.Select(a => a.TeamId).Distinct().ToList();
            var positionIds = assignments.Select(a => a.PositionId).Distinct().ToList();

            var validTeamIds = await _context.Teams
                .Where(t => t.DeletedAt == null && teamIds.Contains(t.Id))
                .Select(t => t.Id)
                .ToListAsync();

            if (validTeamIds.Count != teamIds.Count)
                return new ApiResponse<UserManagementUserResponse>("400", "Uma ou mais equipes são inválidas", null);

            var validPositionIds = await _context.Positions
                .Where(p => positionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            if (validPositionIds.Count != positionIds.Count)
                return new ApiResponse<UserManagementUserResponse>("400", "Um ou mais cargos são inválidos", null);

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var emailAlreadyUsed = await _userManager.Users
                .AnyAsync(u => u.Email == normalizedEmail && u.Id != id);

            if (emailAlreadyUsed)
                return new ApiResponse<UserManagementUserResponse>("400", "Já existe um usuário com este e-mail", null);

            if (!string.IsNullOrWhiteSpace(profile.AvatarUrl) && profile.AvatarUrl != request.AvatarUrl)
            {
                _fileService.DeleteFile(profile.AvatarUrl);
            }

            profile.Name = request.Name;
            profile.AvatarUrl = request.AvatarUrl;
            profile.IsActive = request.IsActive;
            profile.UpdatedAt = DateTime.UtcNow;

            if (profile.User != null)
            {
                profile.User.Email = normalizedEmail;
                profile.User.UserName = normalizedEmail;
                var userUpdateResult = await _userManager.UpdateAsync(profile.User);
                if (!userUpdateResult.Succeeded)
                    return new ApiResponse<UserManagementUserResponse>("400", "Erro ao atualizar credenciais do usuário", null);
            }

            _context.ProfileTeams.RemoveRange(profile.ProfileTeams);
            foreach (var assignment in assignments)
            {
                _context.ProfileTeams.Add(new ProfileTeam
                {
                    ProfileId = profile.Id,
                    TeamId = assignment.TeamId,
                    PositionId = assignment.PositionId
                });
            }

            await _context.SaveChangesAsync();

            await _cache.RemoveAsync($"rbac_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v2_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v3_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v4_{profile.UserId}");

            if (profile.User != null)
            {
                await _userManager.UpdateSecurityStampAsync(profile.User);
            }

            var updatedProfile = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Team)
                .Include(p => p.ProfileTeams)
                    .ThenInclude(pt => pt.Position)
                        .ThenInclude(pos => pos.Department)
                .FirstAsync(p => p.Id == id);

            return new ApiResponse<UserManagementUserResponse>("200", "Usuário atualizado com sucesso", MapUser(updatedProfile));
        }

        public async Task<ApiResponse<object>> DeleteUserAsync(Guid id)
        {
            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

            if (profile == null)
                return new ApiResponse<object>("404", "Usuário não encontrado", null);

            if (!string.IsNullOrWhiteSpace(profile.AvatarUrl))
            {
                _fileService.DeleteFile(profile.AvatarUrl);
            }

            profile.IsActive = false;
            profile.DeletedAt = DateTime.UtcNow;
            profile.UpdatedAt = DateTime.UtcNow;

            if (profile.User != null)
            {
                profile.User.LockoutEnabled = true;
                profile.User.LockoutEnd = DateTimeOffset.MaxValue;
                await _userManager.UpdateAsync(profile.User);
            }

            await _context.SaveChangesAsync();

            await _cache.RemoveAsync($"rbac_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v2_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v3_{profile.UserId}");
            await _cache.RemoveAsync($"rbac_v4_{profile.UserId}");

            if (profile.User != null)
            {
                await _userManager.UpdateSecurityStampAsync(profile.User);
            }

            return new ApiResponse<object>("200", "Usuário removido com sucesso", null);
        }

        public async Task<ApiResponse<DepartmentDto>> GetDepartmentByIdAsync(int id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return new ApiResponse<DepartmentDto>("404", "Departamento não encontrado", null);
            return new ApiResponse<DepartmentDto>("200", "", new DepartmentDto(dept.Id, dept.Name));
        }

        public async Task<ApiResponse<PositionDetailResponse>> GetPositionByIdAsync(int id)
        {
            var pos = await _context.Positions.Include(p => p.Accesses).FirstOrDefaultAsync(p => p.Id == id);
            if (pos == null) return new ApiResponse<PositionDetailResponse>("404", "Cargo não encontrado", null);

            var response = new PositionDetailResponse(
                pos.Id,
                pos.Name,
                pos.DepartmentId,
                pos.IsActive,
                pos.Accesses.Select(a => new PositionAccessRequest(a.ScreenId, a.PermissionId, a.Scope ?? "team")).ToList()
            );

            return new ApiResponse<PositionDetailResponse>("200", "", response);
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
                screens.Select(s => new ScreenDto(s.Id, s.Name, s.NameSidebar, s.NameKey)).ToList(),
                new AccessControlIndicatorsResponse(
                    positions.Count,
                    positions.Count(p => p.IsActive),
                    positions.Count(p => !p.IsActive)
                ),
                depts.Count
            );

            return new ApiResponse<AccessControlResponse>("200", "", response);
        }

        public async Task<ApiResponse<DepartmentDto>> CreateDepartmentAsync(SaveDepartmentRequest request)
        {
            var dept = new Department { Name = request.Name };
            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();
            return new ApiResponse<DepartmentDto>("201", "Departamento criado com sucesso", new DepartmentDto(dept.Id, dept.Name));
        }

        public async Task<ApiResponse<DepartmentDto>> UpdateDepartmentAsync(int id, SaveDepartmentRequest request)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return new ApiResponse<DepartmentDto>("404", "Departamento não encontrado", null);

            dept.Name = request.Name;
            await _context.SaveChangesAsync();
            return new ApiResponse<DepartmentDto>("200", "Departamento atualizado com sucesso", new DepartmentDto(dept.Id, dept.Name));
        }

        public async Task<ApiResponse<object>> DeleteDepartmentAsync(int id)
        {
            var dept = await _context.Departments.Include(d => d.Positions).FirstOrDefaultAsync(d => d.Id == id);
            if (dept == null) return new ApiResponse<object>("404", "Departamento não encontrado", null);

            if (dept.Positions.Any())
                return new ApiResponse<object>("400", "Não é possível excluir um departamento que possua cargos vinculados", null);

            _context.Departments.Remove(dept);
            await _context.SaveChangesAsync();
            return new ApiResponse<object>("200", "Departamento removido com sucesso", null);
        }

        public async Task<ApiResponse<PositionResponse>> CreatePositionAsync(SavePositionRequest request)
        {
            var resolvedDepartmentId = await ResolveDepartmentIdAsync(request.DepartmentId, request.NewDepartmentName);
            if (resolvedDepartmentId == 0)
                return new ApiResponse<PositionResponse>("400", "Departamento inválido ou não informado", null);

            var position = new Position
            {
                Name = request.Name,
                DepartmentId = resolvedDepartmentId,
                IsActive = request.IsActive
            };

            _context.Positions.Add(position);
            await _context.SaveChangesAsync(); // Get ID

            if (request.Accesses?.Any() == true)
            {
                foreach (var acc in request.Accesses)
                {
                    _context.Accesses.Add(new Access
                    {
                        PositionId = position.Id,
                        ScreenId = acc.ScreenId,
                        PermissionId = acc.PermissionId,
                        Scope = acc.Scope
                    });
                }
                await _context.SaveChangesAsync();
            }

            return new ApiResponse<PositionResponse>("201", "Cargo criado com sucesso", null);
        }

        public async Task<ApiResponse<PositionResponse>> UpdatePositionAsync(int id, SavePositionRequest request)
        {
            var position = await _context.Positions.Include(p => p.Accesses).FirstOrDefaultAsync(p => p.Id == id);
            if (position == null) return new ApiResponse<PositionResponse>("404", "Cargo não encontrado", null);

            var resolvedDepartmentId = await ResolveDepartmentIdAsync(request.DepartmentId, request.NewDepartmentName);
            if (resolvedDepartmentId == 0)
                return new ApiResponse<PositionResponse>("400", "Departamento inválido ou não informado", null);

            position.Name = request.Name;
            position.DepartmentId = resolvedDepartmentId;
            position.IsActive = request.IsActive;

            // Sync Accesses
            _context.Accesses.RemoveRange(position.Accesses);

            if (request.Accesses?.Any() == true)
            {
                foreach (var acc in request.Accesses)
                {
                    _context.Accesses.Add(new Access
                    {
                        PositionId = position.Id,
                        ScreenId = acc.ScreenId,
                        PermissionId = acc.PermissionId,
                        Scope = acc.Scope
                    });
                }
            }

            await _context.SaveChangesAsync();
            return new ApiResponse<PositionResponse>("200", "Cargo atualizado com sucesso", null);
        }

        private async Task<int> ResolveDepartmentIdAsync(int existingId, string? newName)
        {
            if (existingId > 0) return existingId;

            if (string.IsNullOrWhiteSpace(newName)) return 0;

            var normalizedName = newName.Trim();
            var existingDept = await _context.Departments
                .FirstOrDefaultAsync(d => d.Name.ToLower() == normalizedName.ToLower());

            if (existingDept != null) return existingDept.Id;

            var newDept = new Department { Name = normalizedName };
            _context.Departments.Add(newDept);
            await _context.SaveChangesAsync();

            return newDept.Id;
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
            var response = await _context.Teams
                .Where(t => t.DeletedAt == null)
                .OrderBy(t => t.Name)
                .Select(t => new TeamResponse(t.Id, t.Name, t.IsActive))
                .ToListAsync();

            return new ApiResponse<List<TeamResponse>>("200", "", response);
        }

        public async Task<ApiResponse<TeamResponse>> GetTeamByIdAsync(Guid id)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null);

            if (team == null)
                return new ApiResponse<TeamResponse>("404", "Equipe não encontrada", null);

            return new ApiResponse<TeamResponse>("200", "", MapTeamToResponse(team));
        }

        public async Task<ApiResponse<TeamResponse>> CreateTeamAsync(SaveTeamRequest request)
        {
            var team = new Team
            {
                Name = request.Name,
                IsActive = request.IsActive
            };
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return new ApiResponse<TeamResponse>("201", "Equipe criada com sucesso", MapTeamToResponse(team));
        }

        public async Task<ApiResponse<TeamResponse>> UpdateTeamAsync(Guid id, SaveTeamRequest request)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null);

            if (team == null)
                return new ApiResponse<TeamResponse>("404", "Equipe não encontrada", null);

            team.Name = request.Name;
            team.IsActive = request.IsActive;
            team.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ApiResponse<TeamResponse>("200", "Equipe atualizada com sucesso", MapTeamToResponse(team));
        }

        public async Task<ApiResponse<object>> DeleteTeamAsync(Guid id)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null);

            if (team == null)
                return new ApiResponse<object>("404", "Equipe não encontrada", null);

            var hasProfiles = await _context.ProfileTeams.AnyAsync(pt => pt.TeamId == id);
            if (hasProfiles)
                return new ApiResponse<object>("400", "Equipe possui usuários vinculados", null);

            team.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return new ApiResponse<object>("200", "Equipe removida com sucesso", null);
        }

        private static TeamResponse MapTeamToResponse(Team team) =>
            new TeamResponse(team.Id, team.Name, team.IsActive);

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

        private async Task<UserManagementOptionsResponse> BuildUserOptionsAsync()
        {
            var teams = await _context.Teams
                .Where(t => t.DeletedAt == null)
                .OrderBy(t => t.Name)
                .Select(t => new TeamResponse(t.Id, t.Name, t.IsActive))
                .ToListAsync();

            var positions = await _context.Positions
                .Include(p => p.Department)
                .OrderBy(p => p.Name)
                .Select(p => new PositionOptionResponse(
                    p.Id,
                    p.Name,
                    p.DepartmentId,
                    p.Department.Name,
                    p.IsActive
                ))
                .ToListAsync();

            return new UserManagementOptionsResponse(teams, positions);
        }

        public async Task<ApiResponse<UserManagementOptionsResponse>> GetUserOptionsAsync()
        {
            var options = await BuildUserOptionsAsync();
            return new ApiResponse<UserManagementOptionsResponse>("200", "", options);
        }

        private static UserManagementUserResponse MapUser(Profile profile)
        {
            var assignments = profile.ProfileTeams
                .OrderBy(pt => pt.Team.Name)
                .ThenBy(pt => pt.Position.Name)
                .Select(pt => new ProfileTeamAssignmentResponse(
                    pt.Id,
                    pt.TeamId,
                    pt.Team.Name,
                    pt.PositionId,
                    pt.Position.Name,
                    pt.Position.DepartmentId,
                    pt.Position.Department.Name
                ))
                .ToList();

            return new UserManagementUserResponse(
                profile.Id,
                profile.Name,
                profile.User?.Email ?? string.Empty,
                profile.AvatarUrl,
                profile.IsActive,
                assignments
            );
        }
        public async Task<ApiResponse<object>> ResendInvitationAsync(Guid id)
        {
            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

            if (profile == null)
                return new ApiResponse<object>("404", "Usuário não encontrado", null);

            var normalizedEmail = profile.User.Email!;
            var inviteToken = Guid.NewGuid().ToString("N");

            // Expiration: 7 days (168 hours)
            await _cache.SetAsync($"reset_{inviteToken}", profile.Id.ToString(), TimeSpan.FromHours(168));

            var inviteBaseUrl = _configuration["App:InvitationBaseUrl"] ?? "http://localhost:3000/auth/reset-password";
            var inviteLink = $"{inviteBaseUrl}?token={inviteToken}&email={Uri.EscapeDataString(normalizedEmail)}";

            await _emailService.SendInvitationEmailAsync(normalizedEmail, inviteLink);

            return new ApiResponse<object>("200", "Convite reenviado com sucesso", null);
        }
    }
}
