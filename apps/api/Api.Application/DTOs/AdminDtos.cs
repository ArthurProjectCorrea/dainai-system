using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Api.Application.DTOs
{
    public record CreateProfileRequest(
        [Required] string Name,
        [Required][EmailAddress] string Email,
        [Required] Guid TeamId,
        [Required] int PositionId
    );

    public record PositionResponse(int Id, string Name, int DepartmentId, bool IsActive, List<int> ScreenPermissions);

    public record TeamResponse(Guid Id, string Name, bool IsActive);
    public record SaveTeamRequest(
        [Required(ErrorMessage = "O nome da equipe é obrigatório")]
        string Name,

        bool IsActive
    );

    public record ProfileTeamAssignmentRequest(
        [Required] Guid TeamId,
        [Required] int PositionId
    );

    public record SaveUserRequest(
        [Required(ErrorMessage = "O nome é obrigatório")]
        string Name,

        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        string Email,

        string? AvatarUrl,

        bool IsActive,

        [Required(ErrorMessage = "Informe ao menos uma equipe")]
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

    public record SaveDepartmentRequest(
        [Required(ErrorMessage = "O nome do departamento é obrigatório")]
        string Name
    );

    public record PositionAccessRequest(
        [Required] int ScreenId,
        [Required] int PermissionId,
        string Scope = "team"
    );

    public record PositionDetailResponse(
        int Id,
        string Name,
        int DepartmentId,
        bool IsActive,
        List<PositionAccessRequest> Accesses
    );

    public record SavePositionRequest(
        [Required(ErrorMessage = "O nome do cargo é obrigatório")]
        string Name,

        int DepartmentId,

        string? NewDepartmentName,

        bool IsActive,

        [Required(ErrorMessage = "Informe ao menos um acesso")]
        List<PositionAccessRequest> Accesses
    );
}
