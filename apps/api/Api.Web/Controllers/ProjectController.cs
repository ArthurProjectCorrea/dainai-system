using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Web.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/admin/projects")]
    [Authorize]
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

        [HttpGet]
        [HasPermission("projects_management", "view")]
        public async Task<IActionResult> GetProjects()
        {
            var result = await _projectService.GetProjectsAsync(GetUserId(), GetActiveTeamId());
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("{id}")]
        [HasPermission("projects_management", "view")]
        public async Task<IActionResult> GetProjectById(Guid id)
        {
            var result = await _projectService.GetProjectByIdAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPost]
        [HasPermission("projects_management", "create")]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
        {
            var result = await _projectService.CreateProjectAsync(GetUserId(), GetActiveTeamId(), request);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPut("{id}")]
        [HasPermission("projects_management", "update")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
        {
            var result = await _projectService.UpdateProjectAsync(GetUserId(), GetActiveTeamId(), id, request);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpPost("{id}/rotate-token")]
        [HasPermission("projects_management", "update")] // Token rotation requires update rights
        public async Task<IActionResult> RotateToken(Guid id)
        {
            var result = await _projectService.RotateTokenAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpDelete("{id}")]
        [HasPermission("projects_management", "delete")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var result = await _projectService.DeleteProjectAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("{id}/feedbacks")]
        [HasPermission("projects_management", "view")]
        public async Task<IActionResult> GetProjectFeedbacks(Guid id)
        {
            var result = await _projectService.GetProjectFeedbacksAsync(GetUserId(), GetActiveTeamId(), id);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
