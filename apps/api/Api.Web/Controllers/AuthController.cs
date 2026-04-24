using Api.Application.DTOs;
using Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Realiza a autenticação do usuário
        /// </summary>
        /// <remarks>
        /// Este endpoint valida as credenciais do usuário e cria uma sessão baseada em Cookies.
        /// </remarks>
        /// <param name="request">Credenciais de acesso (email e senha)</param>
        /// <response code="200">Login realizado com sucesso</response>
        /// <response code="401">E-mail ou senha inválidos ou perfil inativo</response>
        /// <response code="403">Equipe do usuário está inativa</response>
        /// <response code="400">Dados da requisição inválidos</response>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(IDictionary<string, string[]>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            if (response.Code == "401") return Unauthorized(response);
            if (response.Code == "403") return StatusCode(StatusCodes.Status403Forbidden, response);
            return Ok(response);
        }

        /// <summary>
        /// Obtém os dados do usuário autenticado e suas permissões (RBAC)
        /// </summary>
        /// <remarks>
        /// Retorna o perfil do usuário, as equipes vinculadas e o mapa de acessos detalhado.
        /// Este endpoint utiliza cache agressivo no Redis para otimizar a performance.
        /// </remarks>
        /// <response code="200">Perfil recuperado com sucesso</response>
        /// <response code="401">Sessão expirada ou usuário não autenticado</response>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<UserMeResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized(new ApiResponse<object>("401", "Sessão inválida", null));

            var response = await _authService.GetMeAsync(Guid.Parse(userId));
            return Ok(response);
        }

        /// <summary>
        /// Encerra a sessão do usuário
        /// </summary>
        /// <remarks>
        /// Invalida o cookie de autenticação no servidor e remove os dados de cache RBAC do Redis.
        /// </remarks>
        /// <response code="200">Logout realizado com sucesso</response>
        /// <response code="401">Usuário não autenticado</response>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return Ok(new ApiResponse<object>("200", "Logout realizado com sucesso", null));
        }

        /// <summary>
        /// Solicita a recuperação de senha via e-mail
        /// </summary>
        /// <remarks>
        /// Se o e-mail existir, um código OTP de 6 dígitos será enviado. Por segurança, o retorno é 200 mesmo se o e-mail não existir.
        /// </remarks>
        /// <param name="request">E-mail do usuário</param>
        /// <response code="200">Solicitação processada (e-mail enviado se cadastrado)</response>
        /// <response code="429">Muitas solicitações em curto período</response>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var response = await _authService.ForgotPasswordAsync(request.Email);
            if (response.Code == "429") return StatusCode(StatusCodes.Status429TooManyRequests, response);
            return Ok(response);
        }

        /// <summary>
        /// Valida o código OTP enviado por e-mail
        /// </summary>
        /// <remarks>
        /// Após validar o código, o servidor emite um "Reset-Token" via Cookie HttpOnly necessário para a próxima etapa.
        /// </remarks>
        /// <param name="request">E-mail e código OTP</param>
        /// <response code="200">Código válido. Token de reset emitido.</response>
        /// <response code="400">Código inválido ou expirado</response>
        /// <response code="429">Limite de tentativas excedido (Bloqueio temporário)</response>
        [HttpPost("verify-otp")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<VerifyOtpResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<VerifyOtpResponse>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<VerifyOtpResponse>), StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var response = await _authService.VerifyOtpAsync(request);
            if (response.Code == "429") return StatusCode(StatusCodes.Status429TooManyRequests, response);
            if (response.Code == "400") return BadRequest(response);

            if (response.Data != null)
            {
                Response.Cookies.Append("Reset-Token", response.Data.ResetToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Forçado secure para contexto de segurança sensível
                    SameSite = SameSiteMode.Strict,
                    Path = "/api",
                    Expires = DateTimeOffset.UtcNow.AddMinutes(response.Data.ExpiresInMinutes)
                });
            }

            return Ok(response);
        }

        /// <summary>
        /// Define uma nova senha para a conta
        /// </summary>
        /// <remarks>
        /// Requer o "Reset-Token" (Cookie) obtido na verificação do OTP. 
        /// O token é destruído após o sucesso.
        /// </remarks>
        /// <param name="request">Nova senha e confirmação</param>
        /// <response code="200">Senha alterada com sucesso</response>
        /// <response code="400">Dados inválidos ou senhas não conferem</response>
        /// <response code="401">Contexto de reset inválido ou expirado</response>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new ApiResponse<object>("AUTH_PASSWORD_CONFIRMATION_MISMATCH", "A confirmação de senha não confere.", null));
            }

            if (!Request.Cookies.TryGetValue("Reset-Token", out var resetToken) || string.IsNullOrWhiteSpace(resetToken))
            {
                return Unauthorized(new ApiResponse<object>("AUTH_INVALID_RESET_CONTEXT", "Contexto de reset inválido ou expirado.", null));
            }

            var response = await _authService.ResetPasswordAsync(resetToken, request.NewPassword);
            if (response.Code == "401") return Unauthorized(response);
            if (response.Code == "400") return BadRequest(response);
            Response.Cookies.Delete("Reset-Token", new CookieOptions { Path = "/api" });
            return Ok(response);
        }
    }
}
