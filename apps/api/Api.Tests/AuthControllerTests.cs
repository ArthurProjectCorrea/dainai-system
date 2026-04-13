using Api.Application.DTOs;
using Api.Web.Controllers;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace Api.Tests
{
    public class AuthControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly TestWebApplicationFactory<Program> _factory;

        public AuthControllerTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var client = _factory.CreateClient();
            var loginRequest = new LoginRequest("wrong@email.com", "wrongpassword");

            // Act
            var response = await client.PostAsJsonAsync("/api/v1/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            var content = await response.Content.ReadFromJsonAsync<ApiResponse<LoginResponse>>();
            content!.Code.Should().Be("401");
        }

        [Fact]
        public async Task ForgotPassword_ShouldAlwaysReturnSuccess()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new ForgotPasswordRequest("any@email.com");

            // Act
            var response = await client.PostAsJsonAsync("/api/v1/auth/forgot-password", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();
            content!.Message.Should().Contain("receberá um código");
        }
    }
}
