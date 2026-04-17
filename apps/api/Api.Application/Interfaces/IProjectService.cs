using Api.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IProjectService
    {
        Task<ApiResponse<ProjectListResponse>> GetProjectsAsync(Guid userId, Guid? activeTeamId);
        Task<ApiResponse<ProjectDto>> GetProjectByIdAsync(Guid userId, Guid? activeTeamId, Guid projectId);
        Task<ApiResponse<ProjectDto>> CreateProjectAsync(Guid userId, Guid? activeTeamId, CreateProjectRequest request);
        Task<ApiResponse<ProjectDto>> UpdateProjectAsync(Guid userId, Guid? activeTeamId, Guid projectId, UpdateProjectRequest request);
        Task<ApiResponse<GenerateProjectTokenResponse>> RotateTokenAsync(Guid userId, Guid? activeTeamId, Guid projectId);
        Task<ApiResponse<object>> DeleteProjectAsync(Guid userId, Guid? activeTeamId, Guid projectId);
        Task<ApiResponse<ProjectFeedbackSummaryResponse>> GetProjectFeedbacksAsync(Guid userId, Guid? activeTeamId, Guid projectId);
    }
}
