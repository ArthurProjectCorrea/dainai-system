using System;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Api.Tests.E2E
{
    /// <summary>
    /// Shared fixture that logs in once as admin and provides an authenticated HttpClient
    /// for all E2E tests running against the Docker container at localhost:5000.
    /// Also includes helpers for MailHog OTP retrieval.
    /// </summary>
    public class DockerApiFixture : IAsyncDisposable
    {
        public const string BaseUrl = "http://localhost:5000";
        public const string MailHogUrl = "http://localhost:8025";
        public const string AdminEmail = "admin@empresa.com";
        public const string AdminPassword = "Admin123!";

        private readonly HttpClientHandler _handler;
        public HttpClient Client { get; }

        public DockerApiFixture()
        {
            _handler = new HttpClientHandler
            {
                UseCookies = true,
                CookieContainer = new CookieContainer(),
                AllowAutoRedirect = false,
            };
            Client = new HttpClient(_handler) { BaseAddress = new Uri(BaseUrl) };
        }

        /// <summary>Login as system admin and return true if successful.</summary>
        public async Task<bool> LoginAsAdminAsync()
        {
            var response = await Client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = AdminEmail,
                password = AdminPassword
            });
            return response.IsSuccessStatusCode;
        }

        /// <summary>Creates a new fixture instance that is NOT logged in.</summary>
        public static DockerApiFixture CreateAnonymous() => new DockerApiFixture();

        /// <summary>Polls MailHog for an OTP sent to the given email. Waits up to 10 seconds.</summary>
        public static async Task<string?> GetOtpFromMailHogAsync(string email)
        {
            using var mailhog = new HttpClient { BaseAddress = new Uri(MailHogUrl) };

            for (var i = 0; i < 20; i++)
            {
                await Task.Delay(500);
                try
                {
                    var res = await mailhog.GetAsync("/api/v2/messages");
                    if (!res.IsSuccessStatusCode) continue;

                    var json = await res.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);

                    if (!doc.RootElement.TryGetProperty("items", out var items)) continue;

                    foreach (var item in items.EnumerateArray())
                    {
                        var headers = item.GetProperty("Content").GetProperty("Headers");
                        if (!headers.TryGetProperty("To", out var toArr)) continue;
                        var to = toArr[0].GetString() ?? "";
                        if (!to.Contains(email, StringComparison.OrdinalIgnoreCase)) continue;

                        var body = item.GetProperty("Content").GetProperty("Body").GetString() ?? "";
                        var match = System.Text.RegularExpressions.Regex.Match(body, @"\b(\d{6})\b");
                        if (match.Success) return match.Groups[1].Value;
                    }
                }
                catch { /* retry */ }
            }

            return null;
        }

        /// <summary>Deletes all messages from MailHog to keep tests isolated.</summary>
        public static async Task ClearMailHogAsync()
        {
            try
            {
                using var mailhog = new HttpClient { BaseAddress = new Uri(MailHogUrl) };
                await mailhog.DeleteAsync("/api/v1/messages");
            }
            catch { /* ignore if MailHog unavailable */ }
        }

        public async ValueTask DisposeAsync()
        {
            try { await Client.PostAsync("/api/v1/auth/logout", null); } catch { }
            Client.Dispose();
            _handler.Dispose();
        }
    }
}
