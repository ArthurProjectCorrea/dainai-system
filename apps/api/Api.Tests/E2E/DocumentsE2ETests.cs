using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using Api.Application.DTOs;

namespace Api.Tests.E2E
{
    [Trait("Category", "E2E")]
    [Trait("Module", "Documents")]
    [Collection("DockerApi")]
    public class DocumentsE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;
        private static readonly Guid SeedTeamId = Guid.Parse("d1000000-0000-0000-0000-000000000001");
        private Guid _testProjectId;

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            var loggedIn = await _fixture.LoginAsAdminAsync();
            loggedIn.Should().BeTrue("admin must be logged in for Documents tests");

            // Setup: Create a project for documents
            _fixture.Client.DefaultRequestHeaders.Remove("X-Active-Team-Id");
            _fixture.Client.DefaultRequestHeaders.Add("X-Active-Team-Id", SeedTeamId.ToString());

            var projName = $"DocProject {Guid.NewGuid():N}";
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/projects", new { name = projName });
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            _testProjectId = Guid.Parse(doc.RootElement.GetProperty("data").GetProperty("id").GetString()!);
        }

        public async Task DisposeAsync()
        {
            // Cleanup: Delete the project (and hopefully documents if cascade or manually)
            await _fixture.Client.DeleteAsync($"/api/v1/admin/projects/{_testProjectId}");
            await _fixture.DisposeAsync();
        }

        [Fact]
        public async Task FullDocumentLifecycle_ShouldWorkCorrectly()
        {
            // 1. Create Category
            var catName = $"Category {Guid.NewGuid():N}";
            var catResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/documents/categories", catName);
            catResp.StatusCode.Should().Be(HttpStatusCode.OK);
            var catData = await catResp.Content.ReadFromJsonAsync<ApiResponse<CategoryDto>>();
            var catId = catData!.Data!.Id;

            // 2. Create Document
            var createReq = new CreateDocumentRequest(
                _testProjectId,
                "Test Document",
                "# Initial Content",
                "Draft",
                new List<int> { catId }
            );
            var createResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/documents", createReq);
            createResp.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var docData = await createResp.Content.ReadFromJsonAsync<ApiResponse<DocumentDto>>();
            var docId = docData!.Data!.Id;
            docData.Data.Status.Should().Be("Draft");
            docData.Data.Categories.Should().Contain(c => c.Id == catId);

            // 3. Update Document
            var updateReq = new UpdateDocumentRequest(
                "Updated Name",
                "# Updated Content",
                "Completed",
                new List<int> { catId }
            );
            var updateResp = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/documents/{docId}", updateReq);
            updateResp.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedData = await updateResp.Content.ReadFromJsonAsync<ApiResponse<DocumentDto>>();
            updatedData!.Data!.Name.Should().Be("Updated Name");
            updatedData!.Data!.Status.Should().Be("Completed");

            // 4. Publish Document (v1)
            var publishResp = await _fixture.Client.PostAsync($"/api/v1/admin/documents/{docId}/publish", null);
            publishResp.StatusCode.Should().Be(HttpStatusCode.OK);
            var publishedData = await publishResp.Content.ReadFromJsonAsync<ApiResponse<DocumentDto>>();
            publishedData!.Data!.Status.Should().Be("Published");
            publishedData.Data.CurrentVersion.Should().Be("v1");

            // 5. Edit Published Document (should go back to Draft)
            var editReq = new UpdateDocumentRequest(
                "Updated Name v2",
                "# Updated Content v2",
                "Completed",
                new List<int> { catId }
            );
            var editResp = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/documents/{docId}", editReq);
            editResp.StatusCode.Should().Be(HttpStatusCode.OK);
            var editDocData = await editResp.Content.ReadFromJsonAsync<ApiResponse<DocumentDto>>();
            editDocData!.Data!.Status.Should().Be("Draft"); // Regression check: edited published document must be Draft

            // 6. Publish again (v2)
            await _fixture.Client.PostAsync($"/api/v1/admin/documents/{docId}/publish", null);
            
            // 7. Check Versions
            var versionsResp = await _fixture.Client.GetAsync($"/api/v1/admin/documents/{docId}/versions");
            versionsResp.StatusCode.Should().Be(HttpStatusCode.OK);
            var versionsData = await versionsResp.Content.ReadFromJsonAsync<ApiResponse<List<PublishedDocumentDto>>>();
            versionsData!.Data.Should().HaveCount(2);
            versionsData.Data!.First().Version.Should().Be("v2");
            versionsData.Data!.Last().Version.Should().Be("v1");

            // 8. Get Specific Version
            var v1Id = versionsData.Data.First(v => v.Version == "v1").Id;
            var v1Resp = await _fixture.Client.GetAsync($"/api/v1/admin/documents/versions/{v1Id}");
            v1Resp.StatusCode.Should().Be(HttpStatusCode.OK);
            var v1Data = await v1Resp.Content.ReadFromJsonAsync<ApiResponse<PublishedDocumentDto>>();
            v1Data!.Data!.Content.Should().Be("# Updated Content"); // Content at time of v1 publish
        }

        [Fact]
        public async Task GetDocuments_ShouldFilterByProjectAndReturnIndicators()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/documents");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var body = await response.Content.ReadFromJsonAsync<ApiResponse<DocumentListResponse>>();
            body!.Data!.Indicators.Should().NotBeNull();
            // Since we created documents in the other test (serial execution due to Collection attribute), 
            // the indicators might vary, but they should be present.
        }

        [Fact]
        public async Task GetCategories_ShouldReturnList()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/documents/categories");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<ApiResponse<List<CategoryDto>>>();
            body!.Data.Should().NotBeNull();
        }

        // ─── ERROR SCENARIOS ─────────────────────────────────────────────────────

        [Fact]
        public async Task CreateDocument_WithNonExistentProject_ReturnsBadRequest()
        {
            var req = new CreateDocumentRequest(Guid.NewGuid(), "Fail", "Content", "Draft", new List<int>());
            var resp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/documents", req);
            resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetDocumentById_WithNonExistentId_ReturnsNotFound()
        {
            var resp = await _fixture.Client.GetAsync($"/api/v1/admin/documents/{Guid.NewGuid()}");
            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateDocument_WithNonExistentId_ReturnsNotFound()
        {
            var req = new UpdateDocumentRequest("Fail", "Content", "Draft", new List<int>());
            var resp = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/documents/{Guid.NewGuid()}", req);
            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeleteDocument_WithNonExistentId_ReturnsNotFound()
        {
            var resp = await _fixture.Client.DeleteAsync($"/api/v1/admin/documents/{Guid.NewGuid()}");
            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task PublishDocument_WithNonExistentId_ReturnsNotFound()
        {
            var resp = await _fixture.Client.PostAsync($"/api/v1/admin/documents/{Guid.NewGuid()}/publish", null);
            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetDocumentVersions_WithNonExistentId_ReturnsNotFound()
        {
            var resp = await _fixture.Client.GetAsync($"/api/v1/admin/documents/{Guid.NewGuid()}/versions");
            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetDocumentVersionById_WithNonExistentId_ReturnsNotFound()
        {
            var resp = await _fixture.Client.GetAsync($"/api/v1/admin/documents/versions/{Guid.NewGuid()}");
            resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetDocuments_WhenNotAuthenticated_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var resp = await anon.Client.GetAsync("/api/v1/admin/documents");
            resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }
    }

    public class ApiResponse<T>
    {
        public string Code { get; set; } = "";
        public string Message { get; set; } = "";
        public T? Data { get; set; }
    }
}
