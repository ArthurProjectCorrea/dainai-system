using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendInvitationEmailAsync(string email, string inviteLink);
        Task SendOtpAsync(string email, string code);
    }
}
