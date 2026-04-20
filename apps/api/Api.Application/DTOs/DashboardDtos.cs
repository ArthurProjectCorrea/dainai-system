using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record DashboardStatsResponse(
        int TotalProjects,
        int ActiveProjects,
        int TotalFeedbacks,
        double AverageRating
    );

    public record RatingDistributionDto(int Rating, int Count);

    public record ProjectTrendDto(string ProjectName, double AverageNote, int TotalFeedbacks);

    public record ProjectDashboardResponse(
        DashboardStatsResponse Stats,
        List<RatingDistributionDto> RatingDistribution,
        List<ProjectTrendDto> TopProjects
    );

    public record DocumentStatsResponse(
        int TotalDocuments,
        int PublishedCount,
        int DraftCount,
        int TotalCategories
    );

    public record DocumentStatusDistributionDto(string Status, int Count);

    public record ProjectDocumentStatsDto(string ProjectName, int DocumentCount);

    public record DocumentDashboardResponse(
        DocumentStatsResponse Stats,
        List<DocumentStatusDistributionDto> StatusDistribution,
        List<ProjectDocumentStatsDto> TopProjects
    );
}
