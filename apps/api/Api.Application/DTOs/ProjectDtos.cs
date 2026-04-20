using System;
using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record SidebarItemDto(Guid Id, Guid DocumentId, string? DocumentName, int Order);
    public record SidebarGroupDto(Guid Id, string Title, string Type, int Order, string? Icon, List<SidebarItemDto> Items);

    public record ProjectDto(Guid Id, string Name, Guid TeamId, string TeamName, string? IntegrationToken, bool IsActive, DateTime CreatedAt, int TotalFeedbacks = 0, double AverageFeedbackNote = 0, Dictionary<int, int>? ScoreDistribution = null, List<SidebarGroupDto>? SidebarConfig = null, string? Summary = null);

    public record ProjectIndicatorDto(int TotalProjects, int ActiveProjects, int InactiveProjects);

    public record ProjectListResponse(List<ProjectDto> Projects, ProjectIndicatorDto Indicators);

    public record CreateProjectRequest(string Name, Guid TeamId, string? Summary = null);

    public record UpdateProjectRequest(string Name, Guid TeamId, bool IsActive, List<SidebarGroupDto>? SidebarConfig = null, string? Summary = null);

    // Integrations
    public record GenerateProjectTokenResponse(string IntegrationToken);
}
