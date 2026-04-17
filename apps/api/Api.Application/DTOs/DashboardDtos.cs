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
}
