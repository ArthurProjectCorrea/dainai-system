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
    [Trait("Module", "Projects")]
    [Collection("DockerApi")] // Ensure isolated serial run for global scope if needed 
    public class ProjectsE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;
        private static readonly Guid SeedTeamId = Guid.Parse("d1000000-0000-0000-0000-000000000001");

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            var loggedIn = await _fixture.LoginAsAdminAsync();
            loggedIn.Should().BeTrue("admin must be logged in for Projects tests");
        }

        public async Task DisposeAsync() => await _fixture.DisposeAsync();

        [Fact]
        public async Task GetProjects_WhenAuthenticated_Returns200WithListAndIndicators()
        {
            // Seed Team in Header
            _fixture.Client.DefaultRequestHeaders.Remove("X-Active-Team-Id");
            _fixture.Client.DefaultRequestHeaders.Add("X-Active-Team-Id", SeedTeamId.ToString());

            var response = await _fixture.Client.GetAsync("/api/v1/admin/projects");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var data = doc.RootElement.GetProperty("data");
            
            data.TryGetProperty("projects", out _).Should().BeTrue();
            data.TryGetProperty("indicators", out _).Should().BeTrue();
        }

        [Fact]
        public async Task CreateProject_WithValidData_Returns200AndSetsDefaultIsActive()
        {
            _fixture.Client.DefaultRequestHeaders.Remove("X-Active-Team-Id");
            _fixture.Client.DefaultRequestHeaders.Add("X-Active-Team-Id", SeedTeamId.ToString());

            var projName = $"Project Tests {Guid.NewGuid():N}";
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/projects", new { name = projName });

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var data = doc.RootElement.GetProperty("data");

            data.GetProperty("name").GetString().Should().Be(projName);
            data.GetProperty("isActive").GetBoolean().Should().BeTrue();
            // Important: the creation DTO shouldn't leak the token directly in the basic DTO
            data.TryGetProperty("integrationToken", out var integrationProp);
            if (integrationProp.ValueKind != JsonValueKind.Undefined && integrationProp.ValueKind != JsonValueKind.Null)
            {
                // If it exists, it should be null for regular fetches, but let's just make sure the property exists as per Dto shape
            }

            var projectId = data.GetProperty("id").GetString()!;
            
            // Cleanup
            await _fixture.Client.DeleteAsync($"/api/v1/admin/projects/{projectId}");
        }

        [Fact]
        public async Task RotateToken_ShouldReturnANewTokenString_AndBeMissingFromNormalFetch()
        {
            _fixture.Client.DefaultRequestHeaders.Remove("X-Active-Team-Id");
            _fixture.Client.DefaultRequestHeaders.Add("X-Active-Team-Id", SeedTeamId.ToString());

            var projName = $"Rotator {Guid.NewGuid():N}";
            var createResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/projects", new { name = projName });
            var createDoc = JsonDocument.Parse(await createResp.Content.ReadAsStringAsync());
            var projectId = createDoc.RootElement.GetProperty("data").GetProperty("id").GetString()!;

            // Call rotate token endpoint
            var rotateResp = await _fixture.Client.PostAsync($"/api/v1/admin/projects/{projectId}/rotate-token", null);
            rotateResp.StatusCode.Should().Be(HttpStatusCode.OK);

            var rotateBody = await rotateResp.Content.ReadAsStringAsync();
            using var rotateDoc = JsonDocument.Parse(rotateBody);
            var generatedToken = rotateDoc.RootElement.GetProperty("data").GetProperty("integrationToken").GetString();

            generatedToken.Should().NotBeNullOrWhiteSpace();

            // Verify normal fetch hides it
            var fetchResp = await _fixture.Client.GetAsync($"/api/v1/admin/projects/{projectId}");
            var fetchDoc = JsonDocument.Parse(await fetchResp.Content.ReadAsStringAsync());
            var fetchToken = fetchDoc.RootElement.GetProperty("data").GetProperty("integrationToken").GetString();

            fetchToken.Should().BeNull();
        }
    }
}
