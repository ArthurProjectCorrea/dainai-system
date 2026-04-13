using Api.Application.DTOs;
using FluentAssertions;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Xunit;

namespace Api.Tests
{
    [Trait("Category", "E2E")]
    public class RealIntegrationTests
    {
        private readonly HttpClient _client;
        private const string BaseUrl = "http://localhost:5000";

        public RealIntegrationTests()
        {
            var handler = new HttpClientHandler
            {
                UseCookies = true,
                CookieContainer = new System.Net.CookieContainer()
            };

            _client = new HttpClient(handler) { BaseAddress = new Uri(BaseUrl) };
        }

        [Fact]
        public async Task AdminFlow_CreateProfile_And_ListShouldPersistInDatabase()
        {
            // 1. Login com Admin Root
            var loginResponse = await LoginAsAdminAsync();
            loginResponse.EnsureSuccessStatusCode();

            // 2. Verificar /me
            var meResponse = await _client.GetAsync("/api/v1/auth/me");
            meResponse.EnsureSuccessStatusCode();
            var meData = await meResponse.Content.ReadFromJsonAsync<ApiResponse<UserMeResponse>>();
            meData!.Data!.Profile.Name.Should().Be("Administrador Root");

            // 3. Criar Novo Usuário
            var testEmail = $"teste_{Guid.NewGuid():N}@exemplo.com";
            var createRequest = new CreateProfileRequest(
                "Novo Usuario Teste", 
                testEmail,
                Guid.Parse("d1000000-0000-0000-0000-000000000001"), // ID do seed
                1 // ID do position admin
            );
            var createResponse = await _client.PostAsJsonAsync("/api/v1/admin/profiles", createRequest);
            createResponse.EnsureSuccessStatusCode();

            // 4. Validar se o usuário aparece na lista
            var profilesResponse = await _client.GetAsync("/api/v1/admin/profiles");
            profilesResponse.EnsureSuccessStatusCode();
            var profilesData = await profilesResponse.Content.ReadFromJsonAsync<ApiResponse<System.Collections.Generic.List<ProfileResponse>>>();
            profilesData!.Data.Should().Contain(p => p.Email == testEmail);
            Console.WriteLine("Fluxo Completo Validado com Sucesso!");
        }

        [Fact]
        public async Task AuthFlow_ForgotVerifyReset_ShouldRotatePassword()
        {
            var forgotResponse = await _client.PostAsJsonAsync("/api/v1/auth/forgot-password", new ForgotPasswordRequest("admin@empresa.com"));
            forgotResponse.EnsureSuccessStatusCode();

            var otp = await WaitForLatestOtpAsync("admin@empresa.com");
            otp.Should().NotBeNullOrWhiteSpace();

            var verifyResponse = await _client.PostAsJsonAsync("/api/v1/auth/verify-otp", new VerifyOtpRequest("admin@empresa.com", otp!));
            verifyResponse.EnsureSuccessStatusCode();

            var verifyData = await verifyResponse.Content.ReadFromJsonAsync<ApiResponse<VerifyOtpResponse>>();
            verifyData!.Data!.ResetToken.Should().NotBeNullOrWhiteSpace();

            var resetResponse = await _client.PostAsJsonAsync("/api/v1/auth/reset-password", new ResetPasswordRequest("NewPass@123", "NewPass@123"));
            resetResponse.EnsureSuccessStatusCode();

            var loginNew = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@empresa.com", "NewPass@123"));
            loginNew.EnsureSuccessStatusCode();
        }

        private async Task<HttpResponseMessage> LoginAsAdminAsync()
        {
            var primary = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@empresa.com", "Admin123!"));
            if (primary.IsSuccessStatusCode)
            {
                return primary;
            }

            var fallback = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin@empresa.com", "NewPass@123"));
            return fallback;
        }

        private async Task<string?> WaitForLatestOtpAsync(string email)
        {
            using var mailhog = new HttpClient { BaseAddress = new Uri("http://localhost:8025") };

            for (var attempt = 0; attempt < 20; attempt++)
            {
                var response = await mailhog.GetAsync("/api/v2/messages");
                if (!response.IsSuccessStatusCode)
                {
                    await Task.Delay(500);
                    continue;
                }

                var json = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(json);
                if (!document.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
                {
                    await Task.Delay(500);
                    continue;
                }

                foreach (var item in items.EnumerateArray())
                {
                    var to = item.GetProperty("Content").GetProperty("Headers").GetProperty("To")[0].GetString();
                    if (!string.Equals(to, email, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    var body = item.GetProperty("Content").GetProperty("Body").GetString();
                    var match = Regex.Match(body ?? string.Empty, @"(\d{6})");
                    if (match.Success)
                    {
                        return match.Groups[1].Value;
                    }
                }

                await Task.Delay(500);
            }

            return null;
        }
    }
}
