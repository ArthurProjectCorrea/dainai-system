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
            var htmlBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                    <h2 style='color: #2D3748; text-align: center;'>Bem-vindo ao Dainai System</h2>
                    <p style='color: #4A5568; line-height: 1.6;'>Olá!</p>
                    <p style='color: #4A5568; line-height: 1.6;'>Sua conta foi criada com sucesso. Para começar a utilizar o sistema, você precisa definir sua senha inicial clicando no botão abaixo:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{inviteLink}' style='background: #3182CE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Definir Minha Senha</a>
                    </div>
                    <p style='font-size: 14px; color: #718096; text-align: center;'>Este link expira em breve por motivos de segurança.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 25px 0;' />
                    <p style='font-size: 12px; color: #A0AEC0; text-align: center;'>Equipe de Suporte Dainai</p>
                </div>";

            await SendAsync(email, "Bem-vindo ao Sistema - Convite de Acesso", htmlBody, isHtml: true);
        }

        public async Task SendOtpAsync(string email, string code)
        {
            var htmlBody = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                    <h2 style='color: #2D3748; text-align: center;'>Código de Verificação</h2>
                    <p style='color: #4A5568; line-height: 1.6;'>Olá,</p>
                    <p style='color: #4A5568; line-height: 1.6;'>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Dainai System</strong>. Use o código abaixo para prosseguir:</p>
                    <div style='background: #F7FAFC; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; border: 1px solid #E2E8F0;'>
                        <span style='font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2B6CB0;'>{code}</span>
                    </div>
                    <p style='font-size: 14px; color: #718096; text-align: center;'>Este código expira em <strong>10 minutos</strong>.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 25px 0;' />
                    <p style='font-size: 12px; color: #A0AEC0; text-align: center;'>Se você não solicitou esta alteração, por favor ignore este e-mail. Sua senha permanecerá a mesma.</p>
                </div>";

            await SendAsync(email, "Código de Verificação - Dainai System", htmlBody, isHtml: true);
        }

        private async Task SendAsync(string toEmail, string subject, string body, bool isHtml = false)
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
            mailMessage.IsBodyHtml = isHtml;

            await client.SendMailAsync(mailMessage);
        }
    }
}
