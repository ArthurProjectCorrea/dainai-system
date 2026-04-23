using Api.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IDocumentService
    {
        Task<ApiResponse<DocumentListResponse>> GetDocumentsAsync(Guid userId, Guid? activeTeamId);
        Task<ApiResponse<DocumentDto>> GetDocumentByIdAsync(Guid userId, Guid? activeTeamId, Guid documentId);
        Task<ApiResponse<DocumentDto>> CreateDocumentAsync(Guid userId, Guid? activeTeamId, CreateDocumentRequest request);
        Task<ApiResponse<DocumentDto>> UpdateDocumentAsync(Guid userId, Guid? activeTeamId, Guid documentId, UpdateDocumentRequest request);
        Task<ApiResponse<object>> DeleteDocumentAsync(Guid userId, Guid? activeTeamId, Guid documentId);

        // Versões Publicadas
        Task<ApiResponse<DocumentDto>> PublishDocumentAsync(Guid userId, Guid? activeTeamId, Guid documentId);
        Task<ApiResponse<List<PublishedDocumentDto>>> GetDocumentVersionsAsync(Guid userId, Guid? activeTeamId, Guid documentId);
        Task<ApiResponse<DocumentDto>> GetDocumentVersionByIdAsync(Guid userId, Guid? activeTeamId, Guid versionId);

        // Categorias Globais
        Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync();
        Task<ApiResponse<CategoryDto>> CreateCategoryAsync(string name);

        // Navegação e Busca
        Task<ApiResponse<DocsNavigationDto>> GetDocsNavigationAsync(Guid userId, Guid? activeTeamId);
        Task<ApiResponse<List<DocumentDto>>> SearchDocumentsAsync(Guid userId, Guid? activeTeamId, Guid? projectId, string searchTerm);
        Task<ApiResponse<DocumentDto>> GetPublishedDocumentByIdAsync(Guid userId, Guid? activeTeamId, Guid documentId);
    }
}
