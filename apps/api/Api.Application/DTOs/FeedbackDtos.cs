using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Application.DTOs
{
    public record FeedbackDto(Guid Id, Guid ProjectId, string RefUserId, int Note, DateTime CreatedAt, DateTime? UpdatedAt);

    public record PublicFeedbackRequest(
        [Required] string RefUserId,
        [Range(1, 5, ErrorMessage = "A nota deve estar entre 1 e 5.")] int Note
    );

    public record ProjectFeedbackSummaryResponse(
        Guid ProjectId,
        int TotalFeedbacks,
        double AverageNote,
        List<FeedbackDto> Feedbacks
    );
}
