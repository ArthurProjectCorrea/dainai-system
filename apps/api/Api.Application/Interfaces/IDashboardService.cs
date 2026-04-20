using Api.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<ApiResponse<ProjectDashboardResponse>> GetProjectDashboardAsync(Guid userId, Guid? activeTeamId);
        Task<ApiResponse<DocumentDashboardResponse>> GetDocumentDashboardAsync(Guid userId, Guid? activeTeamId);
    }
}
