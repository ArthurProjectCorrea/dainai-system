using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;

        public ProjectService(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        private async Task<IQueryable<Project>> BuildScopedQueryAsync(Guid userId, Guid? activeTeamId)
        {
            var query = _context.Projects.Include(p => p.Team).Where(p => p.DeletedAt == null);
            var scope = await _authService.GetScopeAsync(userId, activeTeamId, "projects_management");

            if (scope == "all")
                return query; // No team filtering

            if (scope == "user")
            {
                // In project context, if scope is 'user', maybe they only see projects created by them or where they are assigned.
                // Since user_id isn't in Project yet, we strictly fallback to team logic or block it. 
                // For safety, we'll bound it by team.
                if (!activeTeamId.HasValue) return query.Where(p => false);
                return query.Where(p => p.TeamId == activeTeamId.Value);
            }

            // Defaults to "team" 
            if (!activeTeamId.HasValue) return query.Where(p => false);
            return query.Where(p => p.TeamId == activeTeamId.Value);
        }

        public async Task<ApiResponse<ProjectListResponse>> GetProjectsAsync(Guid userId, Guid? activeTeamId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);

            var totalProjects = await query.CountAsync();
            var activeProjects = await query.CountAsync(p => p.IsActive);

            var projects = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ProjectDto(p.Id, p.Name, p.TeamId, p.Team.Name, null, p.IsActive, p.CreatedAt, p.Feedbacks.Count(), p.Feedbacks.Any() ? p.Feedbacks.Average(f => f.Note) : 0, null, null, p.Summary)) // Incluído Summary na listagem básica
                .ToListAsync();

            var indicators = new ProjectIndicatorDto(totalProjects, activeProjects, totalProjects - activeProjects);

            return new ApiResponse<ProjectListResponse>("200", "", new ProjectListResponse(projects, indicators));
        }

        public async Task<ApiResponse<ProjectDto>> GetProjectByIdAsync(Guid userId, Guid? activeTeamId, Guid projectId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var project = await query
                .Include(p => p.Feedbacks)
                .Include(p => p.Team)
                .Include(p => p.SidebarGroups)
                    .ThenInclude(g => g.Items)
                        .ThenInclude(i => i.Document)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return new ApiResponse<ProjectDto>("404", "Projeto não encontrado ou acesso restrito pelo Escopo Atual.", null);

            var distribution = project.Feedbacks.GroupBy(f => f.Note).ToDictionary(g => g.Key, g => g.Count());

            var sidebarConfig = project.SidebarGroups
                .OrderBy(g => g.Order)
                .Select(g => new SidebarGroupDto(
                    g.Id,
                    g.Title,
                    g.Type.ToString(),
                    g.Order,
                    g.Icon,
                    g.Items.OrderBy(i => i.Order).Select(i => new SidebarItemDto(i.Id, i.DocumentId, i.Document.Name, i.Order)).ToList()
                )).ToList();

            // Do not expose token except through Rotation mechanic.
            return new ApiResponse<ProjectDto>("200", "", new ProjectDto(project.Id, project.Name, project.TeamId, project.Team.Name, null, project.IsActive, project.CreatedAt, project.Feedbacks.Count(), project.Feedbacks.Any() ? project.Feedbacks.Average(f => f.Note) : 0, distribution, sidebarConfig, project.Summary));
        }

        public async Task<ApiResponse<ProjectDto>> CreateProjectAsync(Guid userId, Guid? activeTeamId, CreateProjectRequest request)
        {
            // The team should be either the one in the request or the active one
            var targetTeamId = request.TeamId != Guid.Empty ? request.TeamId : activeTeamId;

            if (!targetTeamId.HasValue)
                return new ApiResponse<ProjectDto>("400", "Selecione um Time para o Projeto.", null);

            // Generate initial secure Token
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                TeamId = targetTeamId.Value,
                IntegrationToken = token,
                IsActive = true,
                Summary = request.Summary,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var team = await _context.Teams.FindAsync(project.TeamId);

            return new ApiResponse<ProjectDto>("200", "Projeto criado com sucesso.", new ProjectDto(project.Id, project.Name, project.TeamId, team?.Name ?? "Admin", null, project.IsActive, project.CreatedAt, 0, 0, null, null, project.Summary));
        }

        public async Task<ApiResponse<ProjectDto>> UpdateProjectAsync(Guid userId, Guid? activeTeamId, Guid projectId, UpdateProjectRequest request)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var project = await query.Include(p => p.Feedbacks).Include(p => p.Team).FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return new ApiResponse<ProjectDto>("404", "Projeto não encontrado ou acesso restrito.", null);

            var scope = await _authService.GetScopeAsync(userId, activeTeamId, "projects_management");

            // If they are scope=team, prevent transferring to a team they don't own. (Simplified: allow transfer but they might lose access).
            project.Name = request.Name;
            project.TeamId = request.TeamId;
            project.IsActive = request.IsActive;
            project.Summary = request.Summary;
            project.UpdatedAt = DateTime.UtcNow;

            // Sync Sidebar Configuration if provided
            if (request.SidebarConfig != null)
            {
                // Remove existing groups (Cascade will handle items)
                var existingGroups = await _context.ProjectSidebarGroups.Where(g => g.ProjectId == projectId).ToListAsync();
                _context.ProjectSidebarGroups.RemoveRange(existingGroups);

                // Add new groups
                foreach (var groupDto in request.SidebarConfig)
                {
                    var group = new ProjectSidebarGroup
                    {
                        Id = Guid.NewGuid(),
                        ProjectId = project.Id,
                        Title = groupDto.Title,
                        Type = Enum.Parse<SidebarGroupType>(groupDto.Type),
                        Order = groupDto.Order,
                        Icon = groupDto.Icon
                    };

                    _context.ProjectSidebarGroups.Add(group);

                    foreach (var itemDto in groupDto.Items)
                    {
                        var item = new ProjectSidebarItem
                        {
                            Id = Guid.NewGuid(),
                            GroupId = group.Id,
                            DocumentId = itemDto.DocumentId,
                            Order = itemDto.Order
                        };
                        _context.ProjectSidebarItems.Add(item);
                    }
                }
            }


            await _context.SaveChangesAsync();

            var distribution = project.Feedbacks.GroupBy(f => f.Note).ToDictionary(g => g.Key, g => g.Count());

            // Re-load team just in case it was changed
            if (project.Team == null || project.Team.Id != project.TeamId)
            {
                _context.Entry(project).Reference(p => p.Team).Load();
            }

            return new ApiResponse<ProjectDto>("200", "Projeto salvo.", new ProjectDto(project.Id, project.Name, project.TeamId, project.Team?.Name ?? "N/A", null, project.IsActive, project.CreatedAt, project.Feedbacks.Count(), project.Feedbacks.Any() ? project.Feedbacks.Average(f => f.Note) : 0, distribution, null, project.Summary));
        }

        public async Task<ApiResponse<GenerateProjectTokenResponse>> RotateTokenAsync(Guid userId, Guid? activeTeamId, Guid projectId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var project = await query.FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return new ApiResponse<GenerateProjectTokenResponse>("404", "Projeto não encontrado.", null);

            var newToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

            project.IntegrationToken = newToken;
            project.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // This is the ONLY endpoint and moment the token is returned raw.
            return new ApiResponse<GenerateProjectTokenResponse>("200", "Token gerado. Copie agora, ele não será exibido de novo.", new GenerateProjectTokenResponse(newToken));
        }

        public async Task<ApiResponse<object>> DeleteProjectAsync(Guid userId, Guid? activeTeamId, Guid projectId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var project = await query.FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return new ApiResponse<object>("404", "Projeto não encontrado.", null);

            project.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new ApiResponse<object>("200", "Projeto exlcuído.", null);
        }

        public async Task<ApiResponse<ProjectFeedbackSummaryResponse>> GetProjectFeedbacksAsync(Guid userId, Guid? activeTeamId, Guid projectId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var projectExists = await query.AnyAsync(p => p.Id == projectId);

            if (!projectExists) return new ApiResponse<ProjectFeedbackSummaryResponse>("404", "Projeto não encontrado.", null);

            var feedbacks = await _context.ProjectFeedbacks
               .Where(f => f.ProjectId == projectId)
               .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
               .ToListAsync();

            double average = feedbacks.Count > 0 ? feedbacks.Average(f => f.Note) : 0;

            var dtoList = feedbacks.Select(f => new FeedbackDto(f.Id, f.ProjectId, f.RefUserId, f.Note, f.CreatedAt, f.UpdatedAt)).ToList();

            return new ApiResponse<ProjectFeedbackSummaryResponse>("200", "", new ProjectFeedbackSummaryResponse(projectId, feedbacks.Count, average, dtoList));
        }
    }
}
