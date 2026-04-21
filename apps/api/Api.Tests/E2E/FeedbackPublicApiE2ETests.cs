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
    [Trait("Module", "PublicFeedback")]
    public class FeedbackPublicApiE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;
        private static readonly Guid SeedTeamId = Guid.Parse("d1000000-0000-0000-0000-000000000001");
        
        private string _activeProjectToken = "";
        private string _activeProjectId = "";

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            await _fixture.LoginAsAdminAsync();
            
            // Create a disposable project and get its token for public tests
            _fixture.Client.DefaultRequestHeaders.Remove("X-Active-Team-Id");
            _fixture.Client.DefaultRequestHeaders.Add("X-Active-Team-Id", SeedTeamId.ToString());

            var createResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/projects", new { name = $"Public Tests {Guid.NewGuid():N}" });
            var createDoc = JsonDocument.Parse(await createResp.Content.ReadAsStringAsync());
            _activeProjectId = createDoc.RootElement.GetProperty("data").GetProperty("id").GetString()!;

            var rotateResp = await _fixture.Client.PostAsync($"/api/v1/admin/projects/{_activeProjectId}/rotate-token", null);
            var rotateDoc = JsonDocument.Parse(await rotateResp.Content.ReadAsStringAsync());
            _activeProjectToken = rotateDoc.RootElement.GetProperty("data").GetProperty("integrationToken").GetString()!;
        }

        public async Task DisposeAsync() 
        {
            await _fixture.Client.DeleteAsync($"/api/v1/admin/projects/{_activeProjectId}");
            await _fixture.DisposeAsync();
        }

        [Fact]
        public async Task SubmitFeedback_WithoutToken_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var response = await anon.Client.PostAsJsonAsync("/api/v1/public/feedbacks", new { refUserId = "123", note = 5 });
            
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task SubmitFeedback_WithValidToken_RegistersFeedback_AndUpsertsProperly()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            anon.Client.DefaultRequestHeaders.Add("x-project-token", _activeProjectToken);

            var refUser = $"ext_user_{Guid.NewGuid():N}";

            // 1. Initial Insert (Note: 3)
            var insertResp = await anon.Client.PostAsJsonAsync("/api/v1/public/feedbacks", new { refUserId = refUser, note = 3 });
            insertResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Fetch to ensure there's exactly 1 feedback with Note=3
            var verifyResp1 = await _fixture.Client.GetAsync($"/api/v1/admin/projects/{_activeProjectId}/feedbacks");
            var body1 = await verifyResp1.Content.ReadAsStringAsync();
            using var doc1 = JsonDocument.Parse(body1);
            var stats1 = doc1.RootElement.GetProperty("data");
            
            stats1.GetProperty("totalFeedbacks").GetInt32().Should().Be(1);
            stats1.GetProperty("averageNote").GetDouble().Should().Be(3.0);

            // 2. Upsert (Change note to 5 for the SAME ref user)
            var updateResp = await anon.Client.PostAsJsonAsync("/api/v1/public/feedbacks", new { refUserId = refUser, note = 5 });
            updateResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Fetch to ensure total is STILL exactly 1, but Note=5
            var verifyResp2 = await _fixture.Client.GetAsync($"/api/v1/admin/projects/{_activeProjectId}/feedbacks");
            var body2 = await verifyResp2.Content.ReadAsStringAsync();
            using var doc2 = JsonDocument.Parse(body2);
            var stats2 = doc2.RootElement.GetProperty("data");

            stats2.GetProperty("totalFeedbacks").GetInt32().Should().Be(1);
            stats2.GetProperty("averageNote").GetDouble().Should().Be(5.0);

            await anon.DisposeAsync();
        }

        // ─── ERROR SCENARIOS ─────────────────────────────────────────────────────

        [Fact]
        public async Task SubmitFeedback_WithInvalidToken_ReturnsUnauthorized()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            anon.Client.DefaultRequestHeaders.Add("x-project-token", "invalid-token");

            var response = await anon.Client.PostAsJsonAsync("/api/v1/public/feedbacks", new { refUserId = "123", note = 5 });
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task SubmitFeedback_WithNoteOutOfRange_ReturnsBadRequest()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            anon.Client.DefaultRequestHeaders.Add("x-project-token", _activeProjectToken);

            var response = await anon.Client.PostAsJsonAsync("/api/v1/public/feedbacks", new { refUserId = "123", note = 10 });
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task SubmitFeedback_WithMissingRefUserId_ReturnsBadRequest()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            anon.Client.DefaultRequestHeaders.Add("x-project-token", _activeProjectToken);

            var response = await anon.Client.PostAsJsonAsync("/api/v1/public/feedbacks", new { note = 5 });
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            await anon.DisposeAsync();
        }
    }
}
