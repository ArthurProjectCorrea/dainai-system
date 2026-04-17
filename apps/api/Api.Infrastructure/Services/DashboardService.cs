using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;

        public DashboardService(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        private async Task<IQueryable<Project>> BuildScopedQueryAsync(Guid userId, Guid? activeTeamId)
        {
            var query = _context.Projects.Where(p => p.DeletedAt == null);
            var scope = await _authService.GetScopeAsync(userId, activeTeamId, "projects_management");

            if (scope == "all")
                return query;

            if (scope == "user" || scope == "team")
            {
                if (!activeTeamId.HasValue) return query.Where(p => false);
                return query.Where(p => p.TeamId == activeTeamId.Value);
            }

            return query.Where(p => false);
        }

        public async Task<ApiResponse<ProjectDashboardResponse>> GetProjectDashboardAsync(Guid userId, Guid? activeTeamId)
        {
            var projectsQuery = await BuildScopedQueryAsync(userId, activeTeamId);

            // Materialize projects stats
            var totalProjects = await projectsQuery.CountAsync();
            var activeProjects = await projectsQuery.CountAsync(p => p.IsActive);

            // Fetch Project IDs to avoid complex subqueries in LINQ to SQL
            var projectIds = await projectsQuery.Select(p => p.Id).ToListAsync();

            // Get Feedbacks related to these scoped projects
            var feedbacksQuery = _context.ProjectFeedbacks
                .Where(f => projectIds.Contains(f.ProjectId));

            var totalFeedbacks = await feedbacksQuery.CountAsync();

            // Use nullable double to safely handle AVG returning NULL in SQL
            var avgRatingRaw = totalFeedbacks > 0
                ? await feedbacksQuery.AverageAsync(f => (double?)f.Note)
                : 0;

            var avgRating = avgRatingRaw ?? 0;

            var stats = new DashboardStatsResponse(totalProjects, activeProjects, totalFeedbacks, avgRating);

            // Rating Distribution (1-5)
            var distribution = await feedbacksQuery
                .GroupBy(f => f.Note)
                .Select(g => new RatingDistributionDto(g.Key, g.Count()))
                .ToListAsync();

            // Project Trends (Top 5)
            // We use a more direct selection to avoid issues with complex navigations
            var topProjects = await projectsQuery
                .Where(p => p.Feedbacks.Any())
                .Select(p => new
                {
                    p.Name,
                    Avg = p.Feedbacks.Average(f => (double?)f.Note),
                    Count = p.Feedbacks.Count
                })
                .OrderByDescending(p => p.Avg)
                .ThenByDescending(p => p.Count)
                .Take(5)
                .ToListAsync();

            var topProjectsDto = topProjects.Select(p => new ProjectTrendDto(
                p.Name,
                p.Avg ?? 0,
                p.Count
            )).ToList();

            return new ApiResponse<ProjectDashboardResponse>("200", "", new ProjectDashboardResponse(stats, distribution, topProjectsDto));
        }
    }
}
