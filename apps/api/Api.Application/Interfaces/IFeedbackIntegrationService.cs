using Api.Application.DTOs;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IFeedbackIntegrationService
    {
        Task<ApiResponse<object>> UpsertFeedbackAsync(string integrationToken, PublicFeedbackRequest request);
    }
}
