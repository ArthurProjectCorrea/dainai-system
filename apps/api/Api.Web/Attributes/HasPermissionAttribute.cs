using Api.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Web.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class HasPermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _screen;
        private readonly string _permission;

        public HasPermissionAttribute(string screen, string permission)
        {
            _screen = screen;
            _permission = permission;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!user.Identity?.IsAuthenticated ?? false)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userIdString = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            Guid? activeTeamId = null;
            var activeTeamHeader = context.HttpContext.Request.Headers["X-Active-Team-Id"].FirstOrDefault();
            if (Guid.TryParse(activeTeamHeader, out var parsedTeamId))
            {
                activeTeamId = parsedTeamId;
            }

            var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
            var hasAccess = await authService.HasPermissionAsync(userId, activeTeamId, _screen, _permission);

            if (!hasAccess)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
