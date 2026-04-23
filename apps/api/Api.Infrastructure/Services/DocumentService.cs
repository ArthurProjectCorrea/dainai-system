using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;

        public DocumentService(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        private async Task<IQueryable<Document>> BuildScopedQueryAsync(Guid userId, Guid? activeTeamId)
        {
            var query = _context.Documents
                .Include(d => d.Project)
                .Include(d => d.DocumentCategories)
                    .ThenInclude(dc => dc.Category)
                .Where(d => d.DeletedAt == null);

            var scope = await _authService.GetScopeAsync(userId, activeTeamId, "documents_management");

            if (scope == "all")
                return query;

            // Se for team ou user (seguindo o padrão atual de paridade), filtra pelo time ativo
            if (!activeTeamId.HasValue)
                return query.Where(d => false);

            return query.Where(d => d.Project.TeamId == activeTeamId.Value);
        }

        private async Task<IQueryable<Document>> BuildWikiScopedQueryAsync(Guid userId, Guid? activeTeamId)
        {
            var query = _context.Documents
                .Include(d => d.Project)
                .Include(d => d.DocumentCategories)
                    .ThenInclude(dc => dc.Category)
                .Where(d => d.DeletedAt == null);

            // A Wiki é aberta para leitura para qualquer membro do time, independente do cargo.
            // Validamos apenas se o usuário pertence ao time solicitado.
            if (!activeTeamId.HasValue)
                return query.Where(d => false);

            // TODO: No futuro, validar se userId realmente pertence ao activeTeamId se o acesso puder ser burlado via header
            return query.Where(d => d.Project.TeamId == activeTeamId.Value);
        }

        public async Task<ApiResponse<DocumentListResponse>> GetDocumentsAsync(Guid userId, Guid? activeTeamId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);

            var total = await query.CountAsync();
            var published = await query.CountAsync(d => d.Status == DocumentStatus.Published);
            var drafts = await query.CountAsync(d => d.Status == DocumentStatus.Draft);

            var documents = await query
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DocumentDto(
                    d.Id,
                    d.ProjectId,
                    d.Project.Name,
                    d.Name,
                    "", // Não retornar conteúdo em listagens por performance
                    d.Status.ToString(),
                    d.CreatedAt,
                    d.UpdatedAt,
                    d.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                    d.PublishedDocuments.Any(),
                    null
                ))
                .ToListAsync();

            var indicators = new DocumentIndicatorDto(total, published, drafts);
            return new ApiResponse<DocumentListResponse>("200", "", new DocumentListResponse(documents, indicators));
        }

        public async Task<ApiResponse<DocumentDto>> GetDocumentByIdAsync(Guid userId, Guid? activeTeamId, Guid documentId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var document = await query
                .Include(d => d.PublishedDocuments)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                return new ApiResponse<DocumentDto>("404", "Documento não encontrado ou acesso restrito.", null);

            var currentVersion = document.PublishedDocuments
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefault()?.Version;

            var dto = new DocumentDto(
                document.Id,
                document.ProjectId,
                document.Project.Name,
                document.Name,
                document.Content,
                document.Status.ToString(),
                document.CreatedAt,
                document.UpdatedAt,
                document.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                document.PublishedDocuments.Any(),
                currentVersion
            );

            return new ApiResponse<DocumentDto>("200", "", dto);
        }

        public async Task<ApiResponse<DocumentDto>> CreateDocumentAsync(Guid userId, Guid? activeTeamId, CreateDocumentRequest request)
        {
            var project = await _context.Projects.FindAsync(request.ProjectId);
            if (project == null) return new ApiResponse<DocumentDto>("400", "Projeto não encontrado.", null);

            var document = new Document
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                Name = request.Name,
                Content = request.Content,
                Status = Enum.TryParse<DocumentStatus>(request.Status, true, out var parsedStatus)
                         ? parsedStatus
                         : DocumentStatus.Draft,
                CreatedById = userId,
                UpdatedById = userId,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var catId in request.CategoryIds)
            {
                document.DocumentCategories.Add(new DocumentCategory { CategoryId = catId });
            }

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return await GetDocumentByIdAsync(userId, activeTeamId, document.Id);
        }

        public async Task<ApiResponse<DocumentDto>> UpdateDocumentAsync(Guid userId, Guid? activeTeamId, Guid documentId, UpdateDocumentRequest request)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var document = await query.Include(d => d.DocumentCategories).FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null) return new ApiResponse<DocumentDto>("404", "Documento não encontrado.", null);

            // Regra: Se um documento publicado for editado, ele volta para Draft para revisão e ignora o status do request
            if (document.Status == DocumentStatus.Published)
            {
                document.Status = DocumentStatus.Draft;
            }
            else if (Enum.TryParse<DocumentStatus>(request.Status, true, out var newStatus))
            {
                // Só atualiza para Published via o método específico PublishDocumentAsync
                if (newStatus != DocumentStatus.Published)
                {
                    document.Status = newStatus;
                }
            }

            document.Name = request.Name;
            document.Content = request.Content;
            document.UpdatedById = userId;
            document.UpdatedAt = DateTime.UtcNow;

            // Atualizar Categorias
            document.DocumentCategories.Clear();
            foreach (var catId in request.CategoryIds)
            {
                document.DocumentCategories.Add(new DocumentCategory { CategoryId = catId });
            }

            await _context.SaveChangesAsync();

            return await GetDocumentByIdAsync(userId, activeTeamId, document.Id);
        }

        public async Task<ApiResponse<object>> DeleteDocumentAsync(Guid userId, Guid? activeTeamId, Guid documentId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var document = await query.FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null) return new ApiResponse<object>("404", "Documento não encontrado.", null);

            var now = DateTime.UtcNow;

            // Soft-delete do documento
            document.DeletedAt = now;

            // Cascade soft-delete para as versões publicadas
            var publishedDocs = await _context.PublishedDocuments
                .Where(p => p.DocumentId == documentId && p.DeletedAt == null)
                .ToListAsync();

            foreach (var pub in publishedDocs)
            {
                pub.DeletedAt = now;
            }

            await _context.SaveChangesAsync();

            return new ApiResponse<object>("200", "Documento e versões removidos.", null);
        }

        public async Task<ApiResponse<DocumentDto>> PublishDocumentAsync(Guid userId, Guid? activeTeamId, Guid documentId)
        {
            var query = await BuildScopedQueryAsync(userId, activeTeamId);
            var document = await query.Include(d => d.PublishedDocuments).FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null) return new ApiResponse<DocumentDto>("404", "Documento não encontrado.", null);

            // Gerar versão sequencial
            int versionNumber = document.PublishedDocuments.Count + 1;
            string versionName = $"v{versionNumber}";

            var snapshot = new PublishedDocument
            {
                Id = Guid.NewGuid(),
                DocumentId = document.Id,
                Version = versionName,
                Content = document.Content,
                PublishedById = userId,
                CreatedAt = DateTime.UtcNow
            };

            document.Status = DocumentStatus.Published;
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedById = userId;

            _context.PublishedDocuments.Add(snapshot);

            // --- Sidebar Auto-grouping ---
            // Check if document is already in the sidebar
            var isInSidebar = await _context.ProjectSidebarItems.AnyAsync(i => i.DocumentId == documentId);
            if (!isInSidebar)
            {
                // Find or create "Outros" group for this project
                var othersGroup = await _context.ProjectSidebarGroups
                    .FirstOrDefaultAsync(g => g.ProjectId == document.ProjectId && g.Title == "Outros");

                if (othersGroup == null)
                {
                    var maxGroupOrder = await _context.ProjectSidebarGroups
                        .Where(g => g.ProjectId == document.ProjectId)
                        .Select(g => (int?)g.Order)
                        .MaxAsync() ?? -1;

                    othersGroup = new ProjectSidebarGroup
                    {
                        Id = Guid.NewGuid(),
                        ProjectId = document.ProjectId,
                        Title = "Outros",
                        Type = SidebarGroupType.List,
                        Order = maxGroupOrder + 1,
                        Icon = "Library" // Default icon
                    };
                    _context.ProjectSidebarGroups.Add(othersGroup);
                }

                var maxItemOrder = await _context.ProjectSidebarItems
                    .Where(i => i.GroupId == othersGroup.Id)
                    .Select(i => (int?)i.Order)
                    .MaxAsync() ?? -1;

                var sidebarItem = new ProjectSidebarItem
                {
                    Id = Guid.NewGuid(),
                    GroupId = othersGroup.Id,
                    DocumentId = document.Id,
                    Order = maxItemOrder + 1
                };
                _context.ProjectSidebarItems.Add(sidebarItem);
            }

            await _context.SaveChangesAsync();


            return await GetDocumentByIdAsync(userId, activeTeamId, document.Id);
        }

        public async Task<ApiResponse<List<PublishedDocumentDto>>> GetDocumentVersionsAsync(Guid userId, Guid? activeTeamId, Guid documentId)
        {
            var query = await BuildWikiScopedQueryAsync(userId, activeTeamId);
            var document = await query.FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null) return new ApiResponse<List<PublishedDocumentDto>>("404", "Documento não encontrado.", null);

            var versions = await _context.PublishedDocuments
                .Where(p => p.DocumentId == documentId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PublishedDocumentDto(
                    p.Id,
                    p.DocumentId,
                    p.Version,
                    "", // Não retornar conteúdo longo na lista de versões
                    p.PublishedBy.Name,
                    p.CreatedAt
                ))
                .ToListAsync();

            return new ApiResponse<List<PublishedDocumentDto>>("200", "", versions);
        }

        public async Task<ApiResponse<DocumentDto>> GetDocumentVersionByIdAsync(Guid userId, Guid? activeTeamId, Guid versionId)
        {
            // Valida acesso ao documento pai primeiro
            var version = await _context.PublishedDocuments
                .Include(p => p.Document)
                    .ThenInclude(d => d.Project)
                .Include(p => p.Document)
                    .ThenInclude(d => d.DocumentCategories)
                        .ThenInclude(dc => dc.Category)
                .Include(p => p.PublishedBy)
                .FirstOrDefaultAsync(p => p.Id == versionId);

            if (version == null) return new ApiResponse<DocumentDto>("404", "Versão não encontrada.", null);

            // Re-validar via query com escopo para o documento pai
            var scopedQuery = await BuildWikiScopedQueryAsync(userId, activeTeamId);
            var hasAccess = await scopedQuery.AnyAsync(d => d.Id == version.DocumentId);

            if (!hasAccess) return new ApiResponse<DocumentDto>("403", "Acesso restrito a esta versão.", null);

            var doc = version.Document;

            var dto = new DocumentDto(
                doc.Id,
                doc.ProjectId,
                doc.Project.Name,
                doc.Name,
                version.Content, // CONTEÚDO DA VERSÃO ESPECÍFICA
                doc.Status.ToString(),
                doc.CreatedAt,
                version.CreatedAt, // USAR DATA DA PUBLICAÇÃO COMO DATA DE ATUALIZAÇÃO NESTA VIEW
                doc.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                true,
                version.Version
            );

            return new ApiResponse<DocumentDto>("200", "", dto);
        }

        public async Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto(c.Id, c.Name))
                .ToListAsync();

            return new ApiResponse<List<CategoryDto>>("200", "", categories);
        }

        public async Task<ApiResponse<CategoryDto>> CreateCategoryAsync(string name)
        {
            var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
            if (existing != null) return new ApiResponse<CategoryDto>("200", "", new CategoryDto(existing.Id, existing.Name));

            var category = new Category { Name = name };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new ApiResponse<CategoryDto>("200", "Categoria criada.", new CategoryDto(category.Id, category.Name));
        }
        public async Task<ApiResponse<DocsNavigationDto>> GetDocsNavigationAsync(Guid userId, Guid? activeTeamId)
        {
            // 1. Buscar Projetos baseados no escopo do usuário
            var projectQuery = _context.Projects.Include(p => p.Team).Where(p => p.DeletedAt == null);
            var projectScope = await _authService.GetScopeAsync(userId, activeTeamId, "projects_management");

            if (projectScope != "all")
            {
                if (!activeTeamId.HasValue)
                    return new ApiResponse<DocsNavigationDto>("200", "", new DocsNavigationDto(new List<ProjectDto>(), new List<DocumentDto>()));

                projectQuery = projectQuery.Where(p => p.TeamId == activeTeamId.Value);
            }

            // Buscamos as entidades puras primeiro com todos os Includes necessários
            var projectsEntities = await projectQuery
                .Include(p => p.Team)
                .Include(p => p.SidebarGroups)
                    .ThenInclude(g => g.Items)
                        .ThenInclude(i => i.Document)
                            .ThenInclude(d => d.PublishedDocuments)
                .OrderBy(p => p.Name)
                .ToListAsync();

            // Transformamos em DTOs em memória para evitar erros de tradução do EF ao lidar com filtros complexos
            var projectsDtos = projectsEntities.Select(p => new ProjectDto(
                p.Id,
                p.Name,
                p.TeamId,
                p.Team?.Name ?? "N/A",
                null,
                p.IsActive,
                p.CreatedAt,
                0,
                0,
                null,
                p.SidebarGroups
                    .OrderBy(g => g.Order)
                    .Select(g => new SidebarGroupDto(
                        g.Id,
                        g.Title,
                        g.Type.ToString(),
                        g.Order,
                        g.Icon,
                        g.Items
                            .Where(i => i.Document != null && i.Document.DeletedAt == null && i.Document.PublishedDocuments.Any())
                            .OrderBy(i => i.Order)
                            .Select(i => new SidebarItemDto(i.Id, i.DocumentId, i.Document.Name, i.Order, true))
                            .ToList()
                    ))
                    .Where(g => g.Items.Count > 0)
                    .ToList(),
                p.Summary
            )).ToList();


            // 2. Buscar Documentos Publicados baseados no escopo de WIKI (leitura pública interna)
            var docQuery = await BuildWikiScopedQueryAsync(userId, activeTeamId);
            var publishedDocsQuery = docQuery.Where(d => d.PublishedDocuments.Any());

            var documents = await publishedDocsQuery
                .OrderBy(d => d.Name)
                .Select(d => new DocumentDto(
                    d.Id,
                    d.ProjectId,
                    d.Project.Name,
                    d.Name,
                    "",
                    d.Status.ToString(),
                    d.CreatedAt,
                    d.UpdatedAt,
                    d.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                    true,
                    null
                ))
                .ToListAsync();

            // 3. Buscar Últimas Atualizações (Top 10 mais recentes)
            var latestUpdates = await publishedDocsQuery
                .OrderByDescending(d => d.UpdatedAt ?? d.CreatedAt)
                .Take(10)
                .Select(d => new DocumentDto(
                    d.Id,
                    d.ProjectId,
                    d.Project.Name,
                    d.Name,
                    "",
                    d.Status.ToString(),
                    d.CreatedAt,
                    d.UpdatedAt,
                    d.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                    true,
                    null
                ))
                .ToListAsync();

            return new ApiResponse<DocsNavigationDto>("200", "", new DocsNavigationDto(projectsDtos, documents, latestUpdates));
        }

        public async Task<ApiResponse<List<DocumentDto>>> SearchDocumentsAsync(Guid userId, Guid? activeTeamId, Guid? projectId, string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new ApiResponse<List<DocumentDto>>("200", "", new List<DocumentDto>());

            var query = await BuildWikiScopedQueryAsync(userId, activeTeamId);

            // Debug Log
            Console.WriteLine($"[Search] User: {userId}, Team: {activeTeamId}, Project: {projectId}, Term: '{searchTerm}'");

            if (projectId.HasValue)
            {
                query = query.Where(d => d.ProjectId == projectId.Value);
            }

            var documents = await query
                .Include(d => d.PublishedDocuments)
                .Where(d => d.PublishedDocuments.Any() &&
                           (EF.Functions.ILike(d.Name, $"%{searchTerm}%") || EF.Functions.ILike(d.Content, $"%{searchTerm}%")))
                .OrderBy(d => d.Name)
                .Select(d => new DocumentDto(
                    d.Id,
                    d.ProjectId,
                    d.Project.Name,
                    d.Name,
                    d.Content,
                    d.Status.ToString(),
                    d.CreatedAt,
                    d.UpdatedAt,
                    d.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                    true,
                    d.PublishedDocuments.OrderByDescending(p => p.CreatedAt).Select(p => p.Version).FirstOrDefault()
                ))
                .ToListAsync();

            Console.WriteLine($"[Search] Results found: {documents.Count}");

            return new ApiResponse<List<DocumentDto>>("200", "", documents);
        }

        public async Task<ApiResponse<DocumentDto>> GetPublishedDocumentByIdAsync(Guid userId, Guid? activeTeamId, Guid documentId)
        {
            var query = await BuildWikiScopedQueryAsync(userId, activeTeamId);
            var document = await query
                .Include(d => d.PublishedDocuments)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                return new ApiResponse<DocumentDto>("404", "Documento não encontrado.", null);

            var latestVersion = document.PublishedDocuments
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefault();

            if (latestVersion == null)
                return new ApiResponse<DocumentDto>("404", "Este documento ainda não possui uma versão publicada.", null);

            var dto = new DocumentDto(
                document.Id,
                document.ProjectId,
                document.Project.Name,
                document.Name,
                latestVersion.Content, // USAR O CONTEÚDO DA VERSÃO PUBLICADA, NÃO O DRAFT
                document.Status.ToString(),
                document.CreatedAt,
                document.UpdatedAt,
                document.DocumentCategories.Select(dc => new CategoryDto(dc.Category.Id, dc.Category.Name)).ToList(),
                true,
                latestVersion.Version
            );

            return new ApiResponse<DocumentDto>("200", "", dto);
        }
    }
}
