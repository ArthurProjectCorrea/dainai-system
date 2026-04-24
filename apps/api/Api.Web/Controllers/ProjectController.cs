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
    [Route("api/v1/admin/projects")]
    [Authorize]
    [Produces("application/json")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private Guid? GetActiveTeamId()
        {
            var header = Request.Headers["X-Active-Team-Id"].FirstOrDefault();
            return Guid.TryParse(header, out var teamId) ? teamId : null;
        }

        /// <summary>
        /// Lista todos os projetos administrativos vinculados ao time ativo
        /// </summary>
        /// <remarks>
        /// Retorna a lista de projetos, incluindo metadados, status de ativação e estatísticas básicas de documentos.
        /// </remarks>
        /// <response code="200">Lista de projetos recuperada com sucesso</response>
        /// <response code="403">Usuário não possui permissão</response>
        [HttpGet]
        [HasPermission("projects_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<ProjectListResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProjects()
        {
            var result = await _projectService.GetProjectsAsync(GetUserId(), GetActiveTeamId());
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Obtém detalhes completos de um projeto por ID
        /// </summary>
        /// <remarks>
        /// Retorna as configurações de identidade, resumo e a estrutura da Sidebar (Wiki) do projeto.
        /// </remarks>
        /// <param name="id">ID único do projeto</param>
        /// <response code="200">Projeto encontrado</response>
        /// <response code="404">Projeto não encontrado</response>
        [HttpGet("{id}")]
        [HasPermission("projects_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<ProjectDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProjectById(Guid id)
        {
            var result = await _projectService.GetProjectByIdAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Cadastra um novo projeto no sistema
        /// </summary>
        /// <remarks>
        /// Cria a estrutura básica de um projeto e gera o Token de acesso inicial.
        /// </remarks>
        /// <param name="request">Dados de identificação do projeto</param>
        /// <response code="201">Projeto criado com sucesso</response>
        [HttpPost]
        [HasPermission("projects_management", "create")]
        [ProducesResponseType(typeof(ApiResponse<ProjectDto>), StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
        {
            var result = await _projectService.CreateProjectAsync(GetUserId(), GetActiveTeamId(), request);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Atualiza as configurações e a Sidebar de um projeto
        /// </summary>
        /// <remarks>
        /// Permite alterar o resumo do projeto e reorganizar a estrutura da Sidebar da Wiki.
        /// </remarks>
        /// <param name="id">ID do projeto</param>
        /// <param name="request">Novos dados de configuração</param>
        /// <response code="200">Projeto atualizado com sucesso</response>
        [HttpPut("{id}")]
        [HasPermission("projects_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<ProjectDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
        {
            var result = await _projectService.UpdateProjectAsync(GetUserId(), GetActiveTeamId(), id, request);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Gera um novo Token de segurança para o projeto
        /// </summary>
        /// <remarks>
        /// Invalida o token anterior e cria um novo. Útil em caso de vazamento do token original.
        /// </remarks>
        /// <param name="id">ID do projeto</param>
        /// <response code="200">Token rotacionado com sucesso</response>
        [HttpPost("{id}/rotate-token")]
        [HasPermission("projects_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<ProjectDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> RotateToken(Guid id)
        {
            var result = await _projectService.RotateTokenAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Remove um projeto e todos os seus vínculos
        /// </summary>
        /// <remarks>
        /// A exclusão de um projeto é uma ação crítica que afeta a visibilidade de todos os documentos vinculados.
        /// </remarks>
        /// <param name="id">ID do projeto a ser removido</param>
        /// <response code="200">Projeto removido com sucesso</response>
        [HttpDelete("{id}")]
        [HasPermission("projects_management", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var result = await _projectService.DeleteProjectAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        /// <summary>
        /// Lista os feedbacks públicos recebidos por este projeto
        /// </summary>
        /// <remarks>
        /// Recupera comentários e avaliações enviados por usuários através da Wiki pública.
        /// </remarks>
        /// <param name="id">ID do projeto</param>
        /// <response code="200">Lista de feedbacks recuperada</response>
        [HttpGet("{id}/feedbacks")]
        [HasPermission("projects_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<ProjectFeedbackSummaryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProjectFeedbacks(Guid id)
        {
            var result = await _projectService.GetProjectFeedbacksAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
