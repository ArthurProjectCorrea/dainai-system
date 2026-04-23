using Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/docs")]
    [Authorize]
    public class DocsController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocsController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private Guid? GetActiveTeamId()
        {
            var header = Request.Headers["X-Active-Team-Id"].FirstOrDefault();
            return Guid.TryParse(header, out var teamId) ? teamId : null;
        }

        [HttpGet("navigation")]
        public async Task<IActionResult> GetNavigation()
        {
            var result = await _documentService.GetDocsNavigationAsync(GetUserId(), GetActiveTeamId());
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] Guid? projectId)
        {
            var result = await _documentService.SearchDocumentsAsync(GetUserId(), GetActiveTeamId(), projectId, q);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentById(Guid id)
        {
            var result = await _documentService.GetPublishedDocumentByIdAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("{id}/versions")]
        public async Task<IActionResult> GetVersions(Guid id)
        {
            var result = await _documentService.GetDocumentVersionsAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("versions/{versionId}")]
        public async Task<IActionResult> GetVersionById(Guid versionId)
        {
            var result = await _documentService.GetDocumentVersionByIdAsync(GetUserId(), GetActiveTeamId(), versionId);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
