using Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using Api.Web.Attributes;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("projects")]
        [HasPermission("projects_management", "view")]
        public async Task<IActionResult> GetProjectDashboard([FromHeader(Name = "x-user-id")] Guid userId, [FromHeader(Name = "x-active-team-id")] Guid? activeTeamId)
        {
            var result = await _dashboardService.GetProjectDashboardAsync(userId, activeTeamId);
            return StatusCode(int.Parse(result.Code), result);
        }

        [HttpGet("documents")]
        [HasPermission("documents_management", "view")]
        public async Task<IActionResult> GetDocumentDashboard([FromHeader(Name = "x-user-id")] Guid userId, [FromHeader(Name = "x-active-team-id")] Guid? activeTeamId)
        {
            var result = await _dashboardService.GetDocumentDashboardAsync(userId, activeTeamId);
            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
