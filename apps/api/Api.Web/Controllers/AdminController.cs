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

        [HttpGet("users")]
        [HasPermission("users_management", "view")]
        public async Task<IActionResult> GetUsers()
        {
            var response = await _adminService.GetUsersAsync();
            return Ok(response);
        }

        [HttpGet("users/{id}")]
        [HasPermission("users_management", "view")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var response = await _adminService.GetUserByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        [HttpPost("users")]
        [HasPermission("users_management", "create")]
        public async Task<IActionResult> CreateUser([FromBody] SaveUserRequest request)
        {
            var response = await _adminService.CreateUserAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("users/{id}")]
        [HasPermission("users_management", "update")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] SaveUserRequest request)
        {
            var response = await _adminService.UpdateUserAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("users/{id}/resend-invitation")]
        [HasPermission("users_management", "update")]
        public async Task<IActionResult> ResendInvitation(Guid id)
        {
            var response = await _adminService.ResendInvitationAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        [HttpDelete("users/{id}")]
        [HasPermission("users_management", "delete")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var response = await _adminService.DeleteUserAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }


        // --- ACCESS CONTROL: DEPARTMENTS ---
        [HttpGet("access-control/departments/{id}")]
        [HasPermission("access_control", "view")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            var response = await _adminService.GetDepartmentByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        [HttpPost("access-control/departments")]
        [HasPermission("access_control", "create")]
        public async Task<IActionResult> CreateDepartment([FromBody] SaveDepartmentRequest request)
        {
            var response = await _adminService.CreateDepartmentAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("access-control/departments/{id}")]
        [HasPermission("access_control", "update")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] SaveDepartmentRequest request)
        {
            var response = await _adminService.UpdateDepartmentAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("access-control/departments/{id}")]
        [HasPermission("access_control", "delete")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var response = await _adminService.DeleteDepartmentAsync(id);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        // --- ACCESS CONTROL: POSITIONS ---
        [HttpGet("access-control/positions/{id}")]
        [HasPermission("access_control", "view")]
        public async Task<IActionResult> GetPositionById(int id)
        {
            var response = await _adminService.GetPositionByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        [HttpGet("access-control")]
        [HasPermission("access_control", "view")]
        public async Task<IActionResult> GetAccessControl()
        {
            var response = await _adminService.GetAccessControlAsync();
            return Ok(response);
        }

        [HttpPost("access-control/positions")]
        [HasPermission("access_control", "create")]
        public async Task<IActionResult> CreatePosition([FromBody] SavePositionRequest request)
        {
            var response = await _adminService.CreatePositionAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        [HttpPut("access-control/positions/{id}")]
        [HasPermission("access_control", "update")]
        public async Task<IActionResult> UpdatePosition(int id, [FromBody] SavePositionRequest request)
        {
            var response = await _adminService.UpdatePositionAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("access-control/positions/{id}")]
        [HasPermission("access_control", "delete")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var response = await _adminService.DeletePositionAsync(id);
            if (response.Code == "404") return NotFound(response);
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
        public async Task<IActionResult> CreateTeam([FromBody] SaveTeamRequest request)
        {
            var response = await _adminService.CreateTeamAsync(request);
            return Ok(response);
        }

        [HttpPut("teams/{id}")]
        [HasPermission("teams_management", "update")]
        public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] SaveTeamRequest request)
        {
            var response = await _adminService.UpdateTeamAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        [HttpDelete("teams/{id}")]
        [HasPermission("teams_management", "delete")]
        public async Task<IActionResult> DeleteTeam(Guid id)
        {
            var response = await _adminService.DeleteTeamAsync(id);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
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
