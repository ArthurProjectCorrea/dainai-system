using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Web.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/admin/documents")]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private Guid? GetActiveTeamId()
        {
            var header = Request.Headers["X-Active-Team-Id"].FirstOrDefault();
            return Guid.TryParse(header, out var teamId) ? teamId : null;
        }

        [HttpGet]
        [HasPermission("documents_management", "view")]
        public async Task<IActionResult> GetDocuments()
        {
            var result = await _documentService.GetDocumentsAsync(GetUserId(), GetActiveTeamId());
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("{id}")]
        [HasPermission("documents_management", "view")]
        public async Task<IActionResult> GetDocumentById(Guid id)
        {
            var result = await _documentService.GetDocumentByIdAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPost]
        [HasPermission("documents_management", "create")]
        public async Task<IActionResult> CreateDocument([FromBody] CreateDocumentRequest request)
        {
            var result = await _documentService.CreateDocumentAsync(GetUserId(), GetActiveTeamId(), request);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPut("{id}")]
        [HasPermission("documents_management", "update")]
        public async Task<IActionResult> UpdateDocument(Guid id, [FromBody] UpdateDocumentRequest request)
        {
            var result = await _documentService.UpdateDocumentAsync(GetUserId(), GetActiveTeamId(), id, request);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpDelete("{id}")]
        [HasPermission("documents_management", "delete")]
        public async Task<IActionResult> DeleteDocument(Guid id)
        {
            var result = await _documentService.DeleteDocumentAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPost("{id}/publish")]
        [HasPermission("documents_management", "approve")]
        public async Task<IActionResult> PublishDocument(Guid id)
        {
            var result = await _documentService.PublishDocumentAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("{id}/versions")]
        [HasPermission("documents_management", "view")]
        public async Task<IActionResult> GetDocumentVersions(Guid id)
        {
            var result = await _documentService.GetDocumentVersionsAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("versions/{versionId}")]
        [HasPermission("documents_management", "view")]
        public async Task<IActionResult> GetDocumentVersionById(Guid versionId)
        {
            var result = await _documentService.GetDocumentVersionByIdAsync(GetUserId(), GetActiveTeamId(), versionId);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("categories")]
        [HasPermission("documents_management", "view")] // Everyone who can view documents can see categories
        public async Task<IActionResult> GetCategories()
        {
            var result = await _documentService.GetCategoriesAsync();
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPost("categories")]
        [HasPermission("documents_management", "create")] 
        public async Task<IActionResult> CreateCategory([FromBody] string name)
        {
            var result = await _documentService.CreateCategoryAsync(name);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
