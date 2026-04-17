using System;
using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record ProjectDto(Guid Id, string Name, Guid TeamId, string TeamName, string? IntegrationToken, bool IsActive, DateTime CreatedAt, int TotalFeedbacks = 0, double AverageFeedbackNote = 0, Dictionary<int, int>? ScoreDistribution = null);

    public record ProjectIndicatorDto(int TotalProjects, int ActiveProjects, int InactiveProjects);

    public record ProjectListResponse(List<ProjectDto> Projects, ProjectIndicatorDto Indicators);

    public record CreateProjectRequest(string Name, Guid TeamId);

    public record UpdateProjectRequest(string Name, Guid TeamId, bool IsActive);

    // Integrations
    public record GenerateProjectTokenResponse(string IntegrationToken);
}
