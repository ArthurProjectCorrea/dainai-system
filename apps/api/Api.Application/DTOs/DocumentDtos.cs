using System;
using System.Collections.Generic;

namespace Api.Application.DTOs
{
    public record CategoryDto(int Id, string Name);

    public record DocumentDto(
        Guid Id,
        Guid ProjectId,
        string ProjectName,
        string Name,
        string Content,
        string Status,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        List<CategoryDto> Categories,
        string? CurrentVersion = null
    );

    public record DocumentIndicatorDto(int TotalDocuments, int PublishedDocuments, int DraftDocuments);

    public record DocumentListResponse(List<DocumentDto> Documents, DocumentIndicatorDto Indicators);

    public record DocsNavigationDto(List<ProjectDto> Projects, List<DocumentDto> Documents, List<DocumentDto> LatestUpdates = null!);

    public record PublishedDocumentDto(
        Guid Id,
        Guid DocumentId,
        string Version,
        string Content,
        string PublishedBy,
        DateTime CreatedAt
    );

    public record CreateDocumentRequest(
        Guid ProjectId,
        string Name,
        string Content,
        string Status,
        List<int> CategoryIds
    );

    public record UpdateDocumentRequest(
        string Name,
        string Content,
        string Status,
        List<int> CategoryIds
    );
}
