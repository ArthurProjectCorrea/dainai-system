using Api.Application.DTOs;
using Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/public/feedbacks")]
    [AllowAnonymous]
    public class PublicFeedbackController : ControllerBase
    {
        private readonly IFeedbackIntegrationService _feedbackIntegrationService;

        public PublicFeedbackController(IFeedbackIntegrationService feedbackIntegrationService)
        {
            _feedbackIntegrationService = feedbackIntegrationService;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] PublicFeedbackRequest request)
        {
            var token = Request.Headers["x-project-token"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(token))
                return Unauthorized(new ApiResponse<object>("401", "Missing x-project-token header.", null));

            var result = await _feedbackIntegrationService.UpsertFeedbackAsync(token, request);

            return StatusCode(int.Parse(result.Code), result);
        }
    }
}
