using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Api.Web.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    [Authorize]
    [Produces("application/json")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // --- PROFILES / USERS ---

        /// <summary>
        /// Lista todos os perfis de acesso do sistema
        /// </summary>
        /// <remarks>
        /// Perfis são as identidades básicas que podem ser vinculadas a usuários em diferentes equipes.
        /// </remarks>
        /// <response code="200">Lista de perfis recuperada</response>
        [HttpGet("profiles")]
        [HasPermission("users_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<List<ProfileResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProfiles()
        {
            var response = await _adminService.GetProfilesAsync();
            return Ok(response);
        }

        /// <summary>
        /// Cria um novo perfil de acesso
        /// </summary>
        /// <param name="request">Dados do perfil</param>
        /// <response code="201">Perfil criado com sucesso</response>
        /// <response code="400">Dados inválidos ou e-mail já cadastrado</response>
        [HttpPost("profiles")]
        [HasPermission("users_management", "create")]
        [ProducesResponseType(typeof(ApiResponse<ProfileResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProfile([FromBody] CreateProfileRequest request)
        {
            var response = await _adminService.CreateProfileAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return CreatedAtAction(nameof(GetProfiles), response);
        }

        /// <summary>
        /// Ativa ou desativa um perfil de acesso
        /// </summary>
        /// <param name="id">ID do perfil</param>
        /// <response code="200">Status alterado com sucesso</response>
        [HttpDelete("profiles/{id}")]
        [HasPermission("users_management", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ToggleProfile(Guid id)
        {
            var response = await _adminService.ToggleProfileActiveAsync(id);
            return Ok(response);
        }

        /// <summary>
        /// Lista todos os usuários e seus vínculos de equipe
        /// </summary>
        /// <remarks>
        /// Retorna uma visão gerencial de usuários, incluindo indicadores de status (Ativo/Inativo).
        /// </remarks>
        /// <response code="200">Lista de usuários recuperada</response>
        [HttpGet("users")]
        [HasPermission("users_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<UsersListResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers()
        {
            var response = await _adminService.GetUsersAsync();
            return Ok(response);
        }

        /// <summary>
        /// Obtém opções para preenchimento de formulários de usuário
        /// </summary>
        /// <remarks>
        /// Retorna listas de equipes, cargos e departamentos disponíveis para vínculo.
        /// </remarks>
        /// <response code="200">Opções recuperadas</response>
        [HttpGet("users/options")]
        [HasPermission("users_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<UserManagementOptionsResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUserOptions()
        {
            var response = await _adminService.GetUserOptionsAsync();
            return Ok(response);
        }

        /// <summary>
        /// Obtém detalhes de um usuário por ID
        /// </summary>
        /// <param name="id">ID do usuário</param>
        /// <response code="200">Usuário encontrado</response>
        /// <response code="404">Usuário não encontrado</response>
        [HttpGet("users/{id}")]
        [HasPermission("users_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<UserDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var response = await _adminService.GetUserByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        /// <summary>
        /// Cria um novo usuário e envia convite por e-mail
        /// </summary>
        /// <param name="request">Dados do usuário e vínculos de equipe</param>
        /// <response code="200">Usuário criado com sucesso</response>
        [HttpPost("users")]
        [HasPermission("users_management", "create")]
        [ProducesResponseType(typeof(ApiResponse<UserManagementUserResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateUser([FromBody] SaveUserRequest request)
        {
            var response = await _adminService.CreateUserAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Atualiza dados e permissões de um usuário existente
        /// </summary>
        /// <param name="id">ID do usuário</param>
        /// <param name="request">Novos dados do usuário</param>
        /// <response code="200">Usuário atualizado com sucesso</response>
        [HttpPut("users/{id}")]
        [HasPermission("users_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<UserManagementUserResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] SaveUserRequest request)
        {
            var response = await _adminService.UpdateUserAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Reenvia o e-mail de convite/ativação para o usuário
        /// </summary>
        /// <param name="id">ID do usuário</param>
        /// <response code="200">E-mail reenviado com sucesso</response>
        [HttpPost("users/{id}/resend-invitation")]
        [HasPermission("users_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ResendInvitation(Guid id)
        {
            var response = await _adminService.ResendInvitationAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        /// <summary>
        /// Remove um usuário do sistema permanentemente
        /// </summary>
        /// <param name="id">ID do usuário</param>
        /// <response code="200">Usuário excluído</response>
        [HttpDelete("users/{id}")]
        [HasPermission("users_management", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var response = await _adminService.DeleteUserAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        // --- ACCESS CONTROL: DEPARTMENTS ---

        /// <summary>
        /// Obtém um departamento pelo ID
        /// </summary>
        /// <param name="id">ID numérico</param>
        /// <response code="200">Departamento encontrado</response>
        [HttpGet("access-control/departments/{id}")]
        [HasPermission("access_control", "view")]
        [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            var response = await _adminService.GetDepartmentByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        /// <summary>
        /// Cria um novo departamento
        /// </summary>
        /// <param name="request">Nome do departamento</param>
        /// <response code="200">Departamento criado</response>
        [HttpPost("access-control/departments")]
        [HasPermission("access_control", "create")]
        [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateDepartment([FromBody] SaveDepartmentRequest request)
        {
            var response = await _adminService.CreateDepartmentAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Atualiza os dados de um departamento
        /// </summary>
        /// <param name="id">ID do departamento</param>
        /// <param name="request">Novos dados</param>
        /// <response code="200">Departamento atualizado</response>
        [HttpPut("access-control/departments/{id}")]
        [HasPermission("access_control", "update")]
        [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] SaveDepartmentRequest request)
        {
            var response = await _adminService.UpdateDepartmentAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Exclui um departamento
        /// </summary>
        /// <param name="id">ID do departamento</param>
        /// <response code="200">Exclusão realizada</response>
        [HttpDelete("access-control/departments/{id}")]
        [HasPermission("access_control", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var response = await _adminService.DeleteDepartmentAsync(id);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        // --- ACCESS CONTROL: POSITIONS ---

        /// <summary>
        /// Obtém um cargo pelo ID
        /// </summary>
        /// <param name="id">ID do cargo</param>
        /// <response code="200">Cargo encontrado</response>
        [HttpGet("access-control/positions/{id}")]
        [HasPermission("access_control", "view")]
        [ProducesResponseType(typeof(ApiResponse<PositionDetailResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPositionById(int id)
        {
            var response = await _adminService.GetPositionByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        /// <summary>
        /// Obtém a matriz completa de Controle de Acesso (Departamentos e Cargos)
        /// </summary>
        /// <response code="200">Matriz recuperada</response>
        [HttpGet("access-control")]
        [HasPermission("access_control", "view")]
        [ProducesResponseType(typeof(ApiResponse<AccessControlResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAccessControl()
        {
            var response = await _adminService.GetAccessControlAsync();
            return Ok(response);
        }

        /// <summary>
        /// Cria um novo cargo vinculado a um departamento
        /// </summary>
        /// <param name="request">Dados do cargo</param>
        /// <response code="200">Cargo criado</response>
        [HttpPost("access-control/positions")]
        [HasPermission("access_control", "create")]
        [ProducesResponseType(typeof(ApiResponse<PositionResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreatePosition([FromBody] SavePositionRequest request)
        {
            var response = await _adminService.CreatePositionAsync(request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Atualiza dados de um cargo
        /// </summary>
        /// <param name="id">ID do cargo</param>
        /// <param name="request">Novos dados</param>
        /// <response code="200">Cargo atualizado</response>
        [HttpPut("access-control/positions/{id}")]
        [HasPermission("access_control", "update")]
        [ProducesResponseType(typeof(ApiResponse<PositionResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdatePosition(int id, [FromBody] SavePositionRequest request)
        {
            var response = await _adminService.UpdatePositionAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Exclui um cargo
        /// </summary>
        /// <param name="id">ID do cargo</param>
        /// <response code="200">Cargo excluído</response>
        [HttpDelete("access-control/positions/{id}")]
        [HasPermission("access_control", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var response = await _adminService.DeletePositionAsync(id);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        /// <summary>
        /// Lista todas as equipes cadastradas
        /// </summary>
        /// <remarks>
        /// Retorna todas as equipes ativas (não excluídas via soft delete).
        /// </remarks>
        /// <response code="200">Lista de equipes retornada com sucesso</response>
        [HttpGet("teams")]
        [HasPermission("teams_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<List<TeamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTeams()
        {
            var response = await _adminService.GetTeamsAsync();
            return Ok(response);
        }

        /// <summary>
        /// Obtém uma equipe pelo ID
        /// </summary>
        /// <param name="id">GUID da equipe</param>
        /// <response code="200">Equipe encontrada</response>
        /// <response code="404">Equipe não encontrada</response>
        [HttpGet("teams/{id}")]
        [HasPermission("teams_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<TeamResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTeamById(Guid id)
        {
            var response = await _adminService.GetTeamByIdAsync(id);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        /// <summary>
        /// Cria uma nova equipe
        /// </summary>
        /// <param name="request">Dados da nova equipe</param>
        /// <response code="200">Equipe criada com sucesso</response>
        [HttpPost("teams")]
        [HasPermission("teams_management", "create")]
        [ProducesResponseType(typeof(ApiResponse<TeamResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateTeam([FromBody] SaveTeamRequest request)
        {
            var response = await _adminService.CreateTeamAsync(request);
            return Ok(response);
        }

        /// <summary>
        /// Atualiza os dados de uma equipe existente
        /// </summary>
        /// <param name="id">GUID da equipe</param>
        /// <param name="request">Novos dados</param>
        /// <response code="200">Equipe atualizada com sucesso</response>
        [HttpPut("teams/{id}")]
        [HasPermission("teams_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<TeamResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] SaveTeamRequest request)
        {
            var response = await _adminService.UpdateTeamAsync(id, request);
            if (response.Code == "404") return NotFound(response);
            return Ok(response);
        }

        /// <summary>
        /// Remove uma equipe (soft delete)
        /// </summary>
        /// <remarks>
        /// A equipe não é removida fisicamente; o campo DeletedAt é preenchido.
        /// </remarks>
        /// <param name="id">GUID da equipe</param>
        /// <response code="200">Equipe removida com sucesso</response>
        [HttpDelete("teams/{id}")]
        [HasPermission("teams_management", "delete")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteTeam(Guid id)
        {
            var response = await _adminService.DeleteTeamAsync(id);
            if (response.Code == "404") return NotFound(response);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }

        // --- SCREENS ---

        /// <summary>
        /// Lista todas as telas/funcionalidades do sistema para gestão de RBAC
        /// </summary>
        /// <response code="200">Lista de telas recuperada</response>
        [HttpGet("screens")]
        [HasPermission("screens_management", "view")]
        [ProducesResponseType(typeof(ApiResponse<List<ScreenResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetScreens()
        {
            var response = await _adminService.GetScreensAsync();
            return Ok(response);
        }

        /// <summary>
        /// Atualiza metadados de uma tela (ex: nome na sidebar)
        /// </summary>
        /// <param name="id">ID da tela</param>
        /// <param name="request">Novos dados da tela</param>
        /// <response code="200">Tela atualizada</response>
        [HttpPut("screens/{id}")]
        [HasPermission("screens_management", "update")]
        [ProducesResponseType(typeof(ApiResponse<ScreenResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateScreen(int id, [FromBody] ScreenResponse request)
        {
            var response = await _adminService.UpdateScreenAsync(id, request);
            if (response.Code == "400") return BadRequest(response);
            return Ok(response);
        }
    }
}
