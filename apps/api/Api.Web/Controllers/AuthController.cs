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

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            if (response.Code == "401") return Unauthorized(response);
            return Ok(response);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var response = await _authService.GetMeAsync(Guid.Parse(userId));
            return Ok(response);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return Ok(new { Message = "Logout realizado com sucesso" });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var response = await _authService.ForgotPasswordAsync(request.Email);
            if (response.Code == "429") return StatusCode(StatusCodes.Status429TooManyRequests, response);
            return Ok(response);
        }

        [HttpPost("verify-otp")]
        [AllowAnonymous]
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
                    Secure = !Request.IsHttps ? false : true,
                    SameSite = SameSiteMode.Strict,
                    Path = "/api",
                    Expires = DateTimeOffset.UtcNow.AddMinutes(response.Data.ExpiresInMinutes)
                });
            }

            return Ok(response);
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new { Code = "AUTH_PASSWORD_CONFIRMATION_MISMATCH", Message = "A confirmação de senha não confere." });
            }

            if (!Request.Cookies.TryGetValue("Reset-Token", out var resetToken) || string.IsNullOrWhiteSpace(resetToken))
            {
                return Unauthorized(new { Code = "AUTH_INVALID_RESET_CONTEXT", Message = "Contexto de reset inválido ou expirado." });
            }

            var response = await _authService.ResetPasswordAsync(resetToken, request.NewPassword);
            if (response.Code == "401") return Unauthorized(response);
            if (response.Code == "400") return BadRequest(response);
            Response.Cookies.Delete("Reset-Token", new CookieOptions { Path = "/api" });
            return Ok(response);
        }
    }
}
