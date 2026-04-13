using System;
using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record CreateProfileRequest(string Name, string Email, Guid TeamId, int PositionId);

    public record PositionResponse(int Id, string Name, int DepartmentId, bool IsActive, List<int> ScreenPermissions);

    public record TeamResponse(Guid Id, string Name, string? LogotipoUrl, bool IsActive);

    public record ScreenResponse(int Id, string Name, string NameSidebar, string NameKey);

    public record AccessControlResponse(
        List<PositionResponse> Data,
        List<DepartmentDto> Departments,
        List<PermissionDto> Permissions,
        List<ScreenDto> Screens
    );

    public record DepartmentDto(int Id, string Name);
}
