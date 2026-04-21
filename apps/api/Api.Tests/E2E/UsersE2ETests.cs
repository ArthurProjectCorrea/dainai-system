using FluentAssertions;
using System;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace Api.Tests.E2E
{
    [Trait("Category", "E2E")]
    [Trait("Module", "Users")]
    public class UsersE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;

        // Seed IDs from DbInitializer
        private static readonly Guid SeedTeamId = Guid.Parse("d1000000-0000-0000-0000-000000000001");
        private const int SeedPositionId = 1;

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            var ok = await _fixture.LoginAsAdminAsync();
            ok.Should().BeTrue("admin must be logged in for Users tests");
        }

        public async Task DisposeAsync() => await _fixture.DisposeAsync();

        private object UserPayload(string email, string name = "User E2E") => new
        {
            name = name,
            email = email,
            avatarUrl = (string?)null,
            isActive = true,
            profileTeams = new[] { new { teamId = SeedTeamId.ToString(), positionId = SeedPositionId } }
        };

        /// <summary>Creates a user and returns its ID from the response.</summary>
        private async Task<string> CreateUserAndGetIdAsync(string email, string name = "User Helper")
        {
            var resp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/users", UserPayload(email, name));
            var body = await resp.Content.ReadAsStringAsync();
            resp.StatusCode.Should().Be(HttpStatusCode.OK, $"creating user {email} should succeed. Response: {body}");
            using var doc = JsonDocument.Parse(body);
            return doc.RootElement.GetProperty("data").GetProperty("id").GetString()!;
        }

        // ─── SUCCESS SCENARIOS ────────────────────────────────────────────────────

        [Fact]
        public async Task GetUsers_WhenAuthenticated_Returns200WithIndicators()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/users");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var data = doc.RootElement.GetProperty("data");
            data.TryGetProperty("users", out _).Should().BeTrue();
            data.TryGetProperty("indicators", out _).Should().BeTrue();
        }

        [Fact]
        public async Task CreateUser_WithValidData_Returns200AndAppearsInList()
        {
            var email = $"user_{Guid.NewGuid().ToString("N")}@teste.com";
            var id = await CreateUserAndGetIdAsync(email, "Usuário E2E Teste");

            id.Should().NotBeNullOrEmpty("create should return the user ID");

            // Confirm in list
            var listResp = await _fixture.Client.GetAsync("/api/v1/admin/users");
            var listBody = await listResp.Content.ReadAsStringAsync();
            listBody.Should().Contain(email);
        }

        [Fact]
        public async Task GetUserById_WithValidId_Returns200WithDetails()
        {
            var email = $"getbyid_{Guid.NewGuid().ToString("N")}@teste.com";
            var userId = await CreateUserAndGetIdAsync(email, "GetById User");

            var response = await _fixture.Client.GetAsync($"/api/v1/admin/users/{userId}");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain(email);
        }

        [Fact]
        public async Task UpdateUser_WithValidId_Returns200()
        {
            var email = $"update_{Guid.NewGuid().ToString("N")}@teste.com";
            var userId = await CreateUserAndGetIdAsync(email, "Update User");

            var updatedName = "Update User Editado";
            var updateResp = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/users/{userId}", new
            {
                name = updatedName,
                email = email,
                avatarUrl = (string?)null,
                isActive = true,
                profileTeams = new[] { new { teamId = SeedTeamId.ToString(), positionId = SeedPositionId } }
            });

            updateResp.StatusCode.Should().Be(HttpStatusCode.OK);

            var listResp = await _fixture.Client.GetAsync("/api/v1/admin/users");
            var listBody = await listResp.Content.ReadAsStringAsync();
            listBody.Should().Contain(updatedName);
        }

        [Fact]
        public async Task DeleteUser_WithValidId_Returns200()
        {
            var email = $"delete_{Guid.NewGuid().ToString("N")}@teste.com";
            var userId = await CreateUserAndGetIdAsync(email, "Delete User");

            var deleteResp = await _fixture.Client.DeleteAsync($"/api/v1/admin/users/{userId}");
            deleteResp.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task ResendInvitation_WithValidId_Returns200()
        {
            var email = $"invite_{Guid.NewGuid().ToString("N")}@teste.com";
            var userId = await CreateUserAndGetIdAsync(email, "Invite User");

            var inviteResp = await _fixture.Client.PostAsync($"/api/v1/admin/users/{userId}/resend-invitation", null);
            inviteResp.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        // ─── ERROR SCENARIOS ─────────────────────────────────────────────────────

        [Fact]
        public async Task GetUsers_WhenNotAuthenticated_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var response = await anon.Client.GetAsync("/api/v1/admin/users");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task GetUserById_WithNonExistentId_Returns404()
        {
            var fakeId = Guid.NewGuid();
            var response = await _fixture.Client.GetAsync($"/api/v1/admin/users/{fakeId}");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateUser_WithDuplicateEmail_Returns400()
        {
            var email = $"dup_{Guid.NewGuid().ToString("N")}@teste.com";
            await CreateUserAndGetIdAsync(email, "First User");

            // Second attempt with the same email
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/users", UserPayload(email, "Duplicate User"));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateUser_WithNonExistentId_Returns404()
        {
            var fakeId = Guid.NewGuid();
            var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/users/{fakeId}", new
            {
                name = "Nobody",
                email = $"nobody_{Guid.NewGuid().ToString("N")}@never.com",
                avatarUrl = (string?)null,
                isActive = true,
                profileTeams = Array.Empty<object>()
            });

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeleteUser_WithNonExistentId_Returns404()
        {
            var fakeId = Guid.NewGuid();
            var response = await _fixture.Client.DeleteAsync($"/api/v1/admin/users/{fakeId}");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task ResendInvitation_WithNonExistentId_Returns404()
        {
            var fakeId = Guid.NewGuid();
            var response = await _fixture.Client.PostAsync($"/api/v1/admin/users/{fakeId}/resend-invitation", null);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}

