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
    [Trait("Module", "Teams")]
    public class TeamsE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            var ok = await _fixture.LoginAsAdminAsync();
            ok.Should().BeTrue("admin must be logged in for Teams tests");
        }

        public async Task DisposeAsync() => await _fixture.DisposeAsync();

        // ─── SUCCESS SCENARIOS ────────────────────────────────────────────────────

        [Fact]
        public async Task GetTeams_WhenAuthenticated_Returns200WithList()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/teams");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            doc.RootElement.TryGetProperty("data", out _).Should().BeTrue();
        }

        [Fact]
        public async Task CreateTeam_WithValidData_Returns200AndPersists()
        {
            var teamName = $"Equipe Teste {Guid.NewGuid().ToString("N")[..8]}";

            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/teams", new
            {
                name = teamName,
                isActive = true,
                logotipoUrl = (string?)null
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Confirm it appears in the list
            var listResp = await _fixture.Client.GetAsync("/api/v1/admin/teams");
            var listBody = await listResp.Content.ReadAsStringAsync();
            listBody.Should().Contain(teamName);
        }

        [Fact]
        public async Task UpdateTeam_WithValidId_Returns200()
        {
            // Create first
            var teamName = $"Equipe Update {Guid.NewGuid().ToString("N")[..8]}";
            var createResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/teams", new
            {
                name = teamName,
                isActive = true,
                logotipoUrl = (string?)null
            });
            createResp.StatusCode.Should().Be(HttpStatusCode.OK);

            var createdJson = await createResp.Content.ReadAsStringAsync();
            using var createdDoc = JsonDocument.Parse(createdJson);
            var teamId = createdDoc.RootElement.GetProperty("data").GetProperty("id").GetString();
            teamId.Should().NotBeNullOrEmpty();

            // Update
            var updatedName = teamName + " Atualizado";
            var updateResp = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/teams/{teamId}", new
            {
                name = updatedName,
                isActive = true,
                logotipoUrl = (string?)null
            });

            updateResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Verify
            var listResp = await _fixture.Client.GetAsync("/api/v1/admin/teams");
            var listBody = await listResp.Content.ReadAsStringAsync();
            listBody.Should().Contain(updatedName);
        }

        [Fact]
        public async Task DeleteTeam_WithValidId_Returns200()
        {
            // Create a team to delete
            var resp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/teams", new
            {
                name = $"Equipe Delete {Guid.NewGuid().ToString("N")[..8]}",
                isActive = true,
                logotipoUrl = (string?)null
            });
            var json = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var id = doc.RootElement.GetProperty("data").GetProperty("id").GetString();

            var deleteResp = await _fixture.Client.DeleteAsync($"/api/v1/admin/teams/{id}");
            deleteResp.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        // ─── ERROR SCENARIOS ─────────────────────────────────────────────────────

        [Fact]
        public async Task GetTeams_WhenNotAuthenticated_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var response = await anon.Client.GetAsync("/api/v1/admin/teams");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task UpdateTeam_WithNonExistentId_Returns404()
        {
            var fakeId = Guid.NewGuid();
            var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/teams/{fakeId}", new
            {
                name = "Inexistente",
                isActive = true,
                logotipoUrl = (string?)null
            });

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeleteTeam_WithNonExistentId_Returns404()
        {
            var fakeId = Guid.NewGuid();
            var response = await _fixture.Client.DeleteAsync($"/api/v1/admin/teams/{fakeId}");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
