using Api.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendInvitationEmailAsync(string email, string inviteLink)
        {
            await SendAsync(
                email,
                "Bem-vindo ao Sistema - Convite de Acesso",
                $"Olá!\n\nSua conta foi criada com sucesso.\nUse o link abaixo para definir sua senha inicial:\n{inviteLink}\n\nEste link expira em breve.");
        }

        public async Task SendOtpAsync(string email, string code)
        {
            await SendAsync(
                email,
                "Código de Verificação",
                $"Seu código de verificação é: {code}\n\nEste código expira em 10 minutos.");
        }

        private async Task SendAsync(string toEmail, string subject, string body)
        {
            var host = _configuration["Smtp:Host"] ?? "localhost";
            var port = int.Parse(_configuration["Smtp:Port"] ?? "1025");
            var sender = _configuration["Smtp:SenderEmail"] ?? "noreply@dainai.local";
            var senderName = _configuration["Smtp:SenderName"] ?? "Dainai";

            using var client = new SmtpClient(host, port);
            using var mailMessage = new MailMessage();
            mailMessage.From = new MailAddress(sender, senderName);
            mailMessage.To.Add(toEmail);
            mailMessage.Subject = subject;
            mailMessage.Body = body;
            mailMessage.IsBodyHtml = false;

            await client.SendMailAsync(mailMessage);
        }
    }
}
