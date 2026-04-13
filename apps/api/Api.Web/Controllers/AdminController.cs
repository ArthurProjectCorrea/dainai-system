using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Api.Web.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // --- PROFILES / USERS ---
        [HttpGet("profiles")]
        [HasPermission("users_management", "view")]
        public async Task<IActionResult> GetProfiles()
        {
            var response = await _adminService.GetProfilesAsync();
            return Ok(response);
        }

        [HttpPost("profiles")]
        [HasPermission("users_management", "create")]
        public async Task<IActionResult> CreateProfile([FromBody] CreateProfileRequest request)
        {
            var response = await _adminService.CreateProfileAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return CreatedAtAction(nameof(GetProfiles), response);
        }

        [HttpDelete("profiles/{id}")]
        [HasPermission("users_management", "delete")]
        public async Task<IActionResult> ToggleProfile(Guid id)
        {
            var response = await _adminService.ToggleProfileActiveAsync(id);
            return Ok(response);
        }

        // --- ACCESS CONTROL ---
        [HttpGet("access-control")]
        [HasPermission("access_control", "view")]
        public async Task<IActionResult> GetAccessControl()
        {
            var response = await _adminService.GetAccessControlAsync();
            return Ok(response);
        }

        [HttpPost("access-control")]
        [HasPermission("access_control", "create")]
        public async Task<IActionResult> CreatePosition([FromBody] Position record)
        {
            var response = await _adminService.CreatePositionAsync(record);
            return Ok(response);
        }

        [HttpDelete("access-control/{id}")]
        [HasPermission("access_control", "delete")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var response = await _adminService.DeletePositionAsync(id);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        // --- TEAMS ---
        [HttpGet("teams")]
        [HasPermission("teams_management", "view")]
        public async Task<IActionResult> GetTeams()
        {
            var response = await _adminService.GetTeamsAsync();
            return Ok(response);
        }

        [HttpPost("teams")]
        [HasPermission("teams_management", "create")]
        public async Task<IActionResult> CreateTeam([FromBody] TeamResponse request)
        {
            var response = await _adminService.CreateTeamAsync(request);
            return Ok(response);
        }

        // --- SCREENS ---
        [HttpGet("screens")]
        [HasPermission("screens_management", "view")]
        public async Task<IActionResult> GetScreens()
        {
            var response = await _adminService.GetScreensAsync();
            return Ok(response);
        }

        [HttpPut("screens/{id}")]
        [HasPermission("screens_management", "update")]
        public async Task<IActionResult> UpdateScreen(int id, [FromBody] ScreenResponse request)
        {
            var response = await _adminService.UpdateScreenAsync(id, request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }
    }
}
