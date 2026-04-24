using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Web.Attributes;
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
    [Route("api/v1/admin/documents")]
    [Authorize]
    [Produces("application/json")]
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

        /// <summary>
        /// Lista todos os documentos administrativos
        /// </summary>
        /// <remarks>
        /// Retorna a lista completa de documentos (rascunhos e publicados) vinculados aos projetos do time ativo.
        /// Inclui indicadores de status (rascunho vs publicado).
        /// </remarks>
        /// <response code="200">Lista recuperada com sucesso</response>
        /// <response code="403">Usuário não possui permissão de visualização</response>
        [HttpGet]
        [HasPermission("documents_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<DocumentListResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDocuments()
        {
            var result = await _documentService.GetDocumentsAsync(GetUserId(), GetActiveTeamId());
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Obtém detalhes de um documento administrativo por ID
        /// </summary>
        /// <remarks>
        /// Retorna o estado atual do documento (rascunho de trabalho), incluindo categorias e projeto vinculado.
        /// </remarks>
        /// <param name="id">ID único do documento</param>
        /// <response code="200">Documento encontrado</response>
        /// <response code="404">Documento não encontrado</response>
        [HttpGet("{id}")]
        [HasPermission("documents_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDocumentById(Guid id)
        {
            var result = await _documentService.GetDocumentByIdAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Cria um novo documento (Rascunho)
        /// </summary>
        /// <remarks>
        /// Inicializa um novo documento vinculado a um projeto. O documento inicia em estado de rascunho.
        /// </remarks>
        /// <param name="request">Dados para criação do documento</param>
        /// <response code="201">Documento criado com sucesso</response>
        /// <response code="400">Dados da requisição inválidos</response>
        [HttpPost]
        [HasPermission("documents_management", "create")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(IDictionary<string, string[]>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDocument([FromBody] CreateDocumentRequest request)
        {
            var result = await _documentService.CreateDocumentAsync(GetUserId(), GetActiveTeamId(), request);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Atualiza o rascunho de um documento existente
        /// </summary>
        /// <remarks>
        /// Altera o conteúdo ou metadados do rascunho de trabalho. Esta ação não afeta a versão publicada na Wiki até que o documento seja publicado novamente.
        /// </remarks>
        /// <param name="id">ID do documento</param>
        /// <param name="request">Novos dados do documento</param>
        /// <response code="200">Documento atualizado com sucesso</response>
        [HttpPut("{id}")]
        [HasPermission("documents_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateDocument(Guid id, [FromBody] UpdateDocumentRequest request)
        {
            var result = await _documentService.UpdateDocumentAsync(GetUserId(), GetActiveTeamId(), id, request);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Exclui um documento e todo seu histórico permanentemente
        /// </summary>
        /// <remarks>
        /// Remove o documento, todos os seus rascunhos e todas as suas versões publicadas. Ação irreversível.
        /// </remarks>
        /// <param name="id">ID do documento a ser excluído</param>
        /// <response code="200">Documento excluído com sucesso</response>
        [HttpDelete("{id}")]
        [HasPermission("documents_management", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteDocument(Guid id)
        {
            var result = await _documentService.DeleteDocumentAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Publica o rascunho atual como uma nova versão oficial
        /// </summary>
        /// <remarks>
        /// Congela o conteúdo atual do rascunho e o torna visível na Wiki como a versão mais recente.
        /// </remarks>
        /// <param name="id">ID do documento a ser publicado</param>
        /// <response code="200">Documento publicado com sucesso</response>
        [HttpPost("{id}/publish")]
        [HasPermission("documents_management", "approve")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> PublishDocument(Guid id)
        {
            var result = await _documentService.PublishDocumentAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Lista o histórico de versões administrativas de um documento
        /// </summary>
        /// <remarks>
        /// Permite aos administradores auditar todas as publicações passadas deste documento.
        /// </remarks>
        /// <param name="id">ID do documento</param>
        /// <response code="200">Histórico recuperado com sucesso</response>
        [HttpGet("{id}/versions")]
        [HasPermission("documents_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<List<PublishedDocumentDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDocumentVersions(Guid id)
        {
            var result = await _documentService.GetDocumentVersionsAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Obtém uma versão específica do histórico administrativo
        /// </summary>
        /// <param name="versionId">ID da versão</param>
        /// <response code="200">Versão encontrada</response>
        [HttpGet("versions/{versionId}")]
        [HasPermission("documents_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<DocumentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDocumentVersionById(Guid versionId)
        {
            var result = await _documentService.GetDocumentVersionByIdAsync(GetUserId(), GetActiveTeamId(), versionId);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Lista todas as categorias de documentos disponíveis
        /// </summary>
        /// <response code="200">Categorias recuperadas</response>
        [HttpGet("categories")]
        [HasPermission("documents_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<List<CategoryDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _documentService.GetCategoriesAsync();
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Cria uma nova categoria de organização
        /// </summary>
        /// <param name="name">Nome da categoria (ex: Técnico, Manual)</param>
        /// <response code="201">Categoria criada</response>
        [HttpPost("categories")]
        [HasPermission("documents_management", "create")]
        [ProducesResponseType(typeof(ApiResponse<CategoryDto>), StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateCategory([FromBody] string name)
        {
            var result = await _documentService.CreateCategoryAsync(name);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
