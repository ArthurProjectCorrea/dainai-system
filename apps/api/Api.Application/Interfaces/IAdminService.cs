using Api.Application.DTOs;
using Api.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IAdminService
    {
        // Profiles & Users
        Task<ApiResponse<List<ProfileResponse>>> GetProfilesAsync();
        Task<ApiResponse<ProfileResponse>> CreateProfileAsync(CreateProfileRequest request);
        Task<ApiResponse<object>> ToggleProfileActiveAsync(Guid id);

        // Access Control
        Task<ApiResponse<AccessControlResponse>> GetAccessControlAsync();
        Task<ApiResponse<PositionResponse>> CreatePositionAsync(Position record);
        Task<ApiResponse<object>> DeletePositionAsync(int id);

        // Teams
        Task<ApiResponse<List<TeamResponse>>> GetTeamsAsync();
        Task<ApiResponse<TeamResponse>> CreateTeamAsync(TeamResponse request);

        // Screens
        Task<ApiResponse<List<ScreenResponse>>> GetScreensAsync();
        Task<ApiResponse<ScreenResponse>> UpdateScreenAsync(int id, ScreenResponse request);
    }
}
