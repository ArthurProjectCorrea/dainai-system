using System;
using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record CreateProfileRequest(string Name, string Email, Guid TeamId, int PositionId);

    public record PositionResponse(int Id, string Name, int DepartmentId, bool IsActive, List<int> ScreenPermissions);

    public record TeamResponse(Guid Id, string Name, string? IconUrl, string? LogotipoUrl, bool IsActive);
    public record SaveTeamRequest(string Name, string? IconUrl, string? LogotipoUrl, bool IsActive);

    public record ProfileTeamAssignmentRequest(Guid TeamId, int PositionId);

    public record SaveUserRequest(
        string Name,
        string Email,
        string? AvatarUrl,
        bool IsActive,
        List<ProfileTeamAssignmentRequest> ProfileTeams
    );

    public record ProfileTeamAssignmentResponse(
        int Id,
        Guid TeamId,
        string TeamName,
        int PositionId,
        string PositionName,
        int DepartmentId,
        string DepartmentName
    );

    public record UserManagementUserResponse(
        Guid Id,
        string Name,
        string Email,
        string? AvatarUrl,
        bool IsActive,
        List<ProfileTeamAssignmentResponse> ProfileTeams
    );

    public record PositionOptionResponse(
        int Id,
        string Name,
        int DepartmentId,
        string DepartmentName,
        bool IsActive
    );

    public record UserManagementOptionsResponse(
        List<TeamResponse> Teams,
        List<PositionOptionResponse> Positions
    );

    public record UserManagementIndicatorsResponse(int Total, int Active, int Inactive);

    public record UsersListResponse(
        List<UserManagementUserResponse> Users,
        UserManagementIndicatorsResponse Indicators,
        UserManagementOptionsResponse Options
    );

    public record UserDetailResponse(UserManagementUserResponse User, UserManagementOptionsResponse Options);

    public record ScreenResponse(int Id, string Name, string NameSidebar, string NameKey);

    public record AccessControlIndicatorsResponse(int Total, int Active, int Inactive);

    public record AccessControlResponse(
        List<PositionResponse> Data,
        List<DepartmentDto> Departments,
        List<PermissionDto> Permissions,
        List<ScreenDto> Screens,
        AccessControlIndicatorsResponse PositionIndicators,
        int DepartmentCount
    );

    public record DepartmentDto(int Id, string Name);

    public record SaveDepartmentRequest(string Name);

    public record PositionAccessRequest(int ScreenId, int PermissionId);

    public record PositionDetailResponse(
        int Id,
        string Name,
        int DepartmentId,
        bool IsActive,
        List<PositionAccessRequest> Accesses
    );

    public record SavePositionRequest(
        string Name,
        int DepartmentId,
        string? NewDepartmentName,
        bool IsActive,
        List<PositionAccessRequest> Accesses
    );
}
