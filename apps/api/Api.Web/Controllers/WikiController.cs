using Api.Application.DTOs;
using Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/wiki")]
    [Authorize]
    [Produces("application/json")]
    public class WikiController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public WikiController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private Guid? GetActiveTeamId()
        {
            var header = Request.Headers["X-Active-Team-Id"].FirstOrDefault();
            return Guid.TryParse(header, out var teamId) ? teamId : null;
        }

        /// <summary>
        /// Obtém a estrutura de navegação da Wiki (Projetos e Documentos)
        /// </summary>
        /// <remarks>
        /// Retorna todos os projetos vinculados ao time ativo e a lista de documentos publicados 
        /// necessários para construir a sidebar de navegação.
        /// </remarks>
        /// <response code="200">Estrutura de navegação recuperada com sucesso</response>
        /// <response code="401">Usuário não autenticado</response>
        [HttpGet("navigation")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNavigation()
        {
            var result = await _documentService.GetDocsNavigationAsync(GetUserId(), GetActiveTeamId());
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Realiza busca textual em documentos publicados
        /// </summary>
        /// <remarks>
        /// Pesquisa por palavras-chave no título e no conteúdo (Markdown) dos documentos.
        /// A busca é filtrada pelo contexto de permissões do usuário e time ativo.
        /// </remarks>
        /// <param name="q">Termo de busca</param>
        /// <param name="projectId">Opcional: Filtrar busca dentro de um projeto específico</param>
        /// <response code="200">Resultados da busca retornados com sucesso</response>
        [HttpGet("search")]
        [ProducesResponseType(typeof(ApiResponse<List<DocumentDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] Guid? projectId)
        {
            var result = await _documentService.SearchDocumentsAsync(GetUserId(), GetActiveTeamId(), projectId, q);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Obtém o conteúdo de um documento publicado por ID
        /// </summary>
        /// <remarks>
        /// Retorna a versão mais recente publicada do documento, incluindo metadados e categorias.
        /// </remarks>
        /// <param name="id">ID único do documento</param>
        /// <response code="200">Documento encontrado e retornado</response>
        /// <response code="404">Documento não encontrado ou não publicado</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDocumentById(Guid id)
        {
            var result = await _documentService.GetPublishedDocumentByIdAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Obtém o histórico de versões publicadas de um documento
        /// </summary>
        /// <remarks>
        /// Lista todas as versões salvas anteriormente para fins de auditoria e consulta histórica.
        /// </remarks>
        /// <param name="id">ID do documento principal</param>
        /// <response code="200">Lista de versões recuperada com sucesso</response>
        [HttpGet("{id}/versions")]
        [ProducesResponseType(typeof(ApiResponse<List<PublishedDocumentDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetVersions(Guid id)
        {
            var result = await _documentService.GetDocumentVersionsAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Obtém o conteúdo de uma versão específica de um documento
        /// </summary>
        /// <remarks>
        /// Recupera o estado congelado de um documento em uma publicação passada através do ID da versão.
        /// </remarks>
        /// <param name="versionId">ID único da versão (Histórico)</param>
        /// <response code="200">Conteúdo da versão recuperado com sucesso</response>
        /// <response code="404">Versão não encontrada</response>
        [HttpGet("versions/{versionId}")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetVersionById(Guid versionId)
        {
            var result = await _documentService.GetDocumentVersionByIdAsync(GetUserId(), GetActiveTeamId(), versionId);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
