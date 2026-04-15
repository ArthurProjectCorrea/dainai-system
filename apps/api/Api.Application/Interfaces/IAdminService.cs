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
        Task<ApiResponse<UsersListResponse>> GetUsersAsync();
        Task<ApiResponse<UserDetailResponse>> GetUserByIdAsync(Guid id);
        Task<ApiResponse<UserManagementUserResponse>> CreateUserAsync(SaveUserRequest request);
        Task<ApiResponse<UserManagementUserResponse>> UpdateUserAsync(Guid id, SaveUserRequest request);
        Task<ApiResponse<object>> DeleteUserAsync(Guid id);
        Task<ApiResponse<object>> ResendInvitationAsync(Guid id);

        // Access Control
        Task<ApiResponse<AccessControlResponse>> GetAccessControlAsync();

        // Departments
        Task<ApiResponse<DepartmentDto>> GetDepartmentByIdAsync(int id);
        Task<ApiResponse<DepartmentDto>> CreateDepartmentAsync(SaveDepartmentRequest request);
        Task<ApiResponse<DepartmentDto>> UpdateDepartmentAsync(int id, SaveDepartmentRequest request);
        Task<ApiResponse<object>> DeleteDepartmentAsync(int id);

        // Positions
        Task<ApiResponse<PositionDetailResponse>> GetPositionByIdAsync(int id);
        Task<ApiResponse<PositionResponse>> CreatePositionAsync(SavePositionRequest request);
        Task<ApiResponse<PositionResponse>> UpdatePositionAsync(int id, SavePositionRequest request);
        Task<ApiResponse<object>> DeletePositionAsync(int id);

        // Teams
        Task<ApiResponse<List<TeamResponse>>> GetTeamsAsync();
        Task<ApiResponse<TeamResponse>> CreateTeamAsync(SaveTeamRequest request);
        Task<ApiResponse<TeamResponse>> UpdateTeamAsync(Guid id, SaveTeamRequest request);
        Task<ApiResponse<object>> DeleteTeamAsync(Guid id);

        // Screens
        Task<ApiResponse<List<ScreenResponse>>> GetScreensAsync();
        Task<ApiResponse<ScreenResponse>> UpdateScreenAsync(int id, ScreenResponse request);
    }
}
