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
    [Trait("Module", "AccessControl")]
    public class AccessControlE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;
        private int _testDepartmentId;

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            var ok = await _fixture.LoginAsAdminAsync();
            ok.Should().BeTrue("admin must be logged in for AccessControl tests");

            // Create a reusable department for position tests
            var deptResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/departments", new
            {
                name = $"Dept Teste {Guid.NewGuid().ToString("N")[..6]}"
            });
            deptResp.StatusCode.Should().Be(HttpStatusCode.OK, "department creation must succeed in InitializeAsync");
            var deptBody = await deptResp.Content.ReadAsStringAsync();
            using var deptDoc = JsonDocument.Parse(deptBody);
            var deptData = deptDoc.RootElement.GetProperty("data");
            _testDepartmentId = deptData.ValueKind == JsonValueKind.Object
                ? deptData.GetProperty("id").GetInt32()
                : await GetLastCreatedDepartmentIdAsync();
        }

        public async Task DisposeAsync() => await _fixture.DisposeAsync();

        /// <summary>Fallback: get the last created department from the list (used when create returns null data).</summary>
        private async Task<int> GetLastCreatedDepartmentIdAsync()
        {
            var resp = await _fixture.Client.GetAsync("/api/v1/admin/access-control");
            var body = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var depts = doc.RootElement.GetProperty("data").GetProperty("departments");
            var lastDept = depts[depts.GetArrayLength() - 1];
            return lastDept.GetProperty("id").GetInt32();
        }

        /// <summary>Creates a position and returns its ID by looking it up in the list afterwards.</summary>
        private async Task<int> CreatePositionAndGetIdAsync(string name)
        {
            await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/positions", new
            {
                name = name,
                departmentId = _testDepartmentId,
                newDepartmentName = (string?)null,
                isActive = true,
                accesses = Array.Empty<object>()
            });

            // The create endpoint returns data: null — get the ID from the positions list
            var resp = await _fixture.Client.GetAsync("/api/v1/admin/access-control");
            var body = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var positions = doc.RootElement.GetProperty("data").GetProperty("data");
            foreach (var pos in positions.EnumerateArray())
            {
                if (pos.GetProperty("name").GetString() == name)
                    return pos.GetProperty("id").GetInt32();
            }
            throw new InvalidOperationException($"Position '{name}' not found after creation");
        }

        // ─── ACCESS CONTROL (overview) ────────────────────────────────────────────

        [Fact]
        public async Task GetAccessControl_WhenAuthenticated_Returns200WithPositionsAndDepartments()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/access-control");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var data = doc.RootElement.GetProperty("data");
            data.TryGetProperty("departments", out _).Should().BeTrue();
            data.TryGetProperty("data", out _).Should().BeTrue(); // positions list
        }

        // ─── DEPARTMENTS ─────────────────────────────────────────────────────────

        [Fact]
        public async Task CreateDepartment_WithValidName_Returns200AndPersists()
        {
            var deptName = $"Dept E2E {Guid.NewGuid().ToString("N")[..6]}";

            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/departments", new
            {
                name = deptName
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var overviewResp = await _fixture.Client.GetAsync("/api/v1/admin/access-control");
            var overviewBody = await overviewResp.Content.ReadAsStringAsync();
            overviewBody.Should().Contain(deptName);
        }

        [Fact]
        public async Task GetDepartmentById_WithValidId_Returns200()
        {
            var response = await _fixture.Client.GetAsync($"/api/v1/admin/access-control/departments/{_testDepartmentId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task UpdateDepartment_WithValidId_Returns200()
        {
            var newName = $"Dept Atualizado {Guid.NewGuid().ToString("N")[..6]}";
            var response = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/access-control/departments/{_testDepartmentId}", new
            {
                name = newName
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task DeleteDepartment_WithNoPositions_Returns200()
        {
            // Create an empty department to delete
            var createResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/departments", new
            {
                name = $"Dept Delete {Guid.NewGuid().ToString("N")[..6]}"
            });
            var body = await createResp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var dataEl = doc.RootElement.GetProperty("data");
            int id;
            if (dataEl.ValueKind == JsonValueKind.Object)
            {
                id = dataEl.GetProperty("id").GetInt32();
            }
            else
            {
                id = await GetLastCreatedDepartmentIdAsync();
            }

            var deleteResp = await _fixture.Client.DeleteAsync($"/api/v1/admin/access-control/departments/{id}");
            deleteResp.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetDepartmentById_WithNonExistentId_Returns404()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/access-control/departments/999999");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateDepartment_WithNonExistentId_Returns404()
        {
            var response = await _fixture.Client.PutAsJsonAsync("/api/v1/admin/access-control/departments/999999", new
            {
                name = "Nobody"
            });
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeleteDepartment_WithNonExistentId_Returns404()
        {
            var response = await _fixture.Client.DeleteAsync("/api/v1/admin/access-control/departments/999999");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        // ─── POSITIONS ───────────────────────────────────────────────────────────

        [Fact]
        public async Task CreatePosition_WithValidData_Returns200AndPersists()
        {
            var posName = $"Cargo E2E {Guid.NewGuid().ToString("N")[..6]}";

            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/positions", new
            {
                name = posName,
                departmentId = _testDepartmentId,
                newDepartmentName = (string?)null,
                isActive = true,
                accesses = Array.Empty<object>()
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var overviewResp = await _fixture.Client.GetAsync("/api/v1/admin/access-control");
            var overviewBody = await overviewResp.Content.ReadAsStringAsync();
            overviewBody.Should().Contain(posName);
        }

        [Fact]
        public async Task GetPositionById_WithValidId_Returns200()
        {
            var posId = await CreatePositionAndGetIdAsync($"Cargo GetById {Guid.NewGuid().ToString("N")[..6]}");

            var response = await _fixture.Client.GetAsync($"/api/v1/admin/access-control/positions/{posId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task UpdatePosition_WithValidId_Returns200()
        {
            var posId = await CreatePositionAndGetIdAsync($"Cargo Update {Guid.NewGuid().ToString("N")[..6]}");

            var updateResp = await _fixture.Client.PutAsJsonAsync($"/api/v1/admin/access-control/positions/{posId}", new
            {
                name = $"Cargo Atualizado {Guid.NewGuid().ToString("N")[..6]}",
                departmentId = _testDepartmentId,
                newDepartmentName = (string?)null,
                isActive = false,
                accesses = Array.Empty<object>()
            });

            updateResp.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task DeletePosition_WithNoUsers_Returns200()
        {
            var posId = await CreatePositionAndGetIdAsync($"Cargo Delete {Guid.NewGuid().ToString("N")[..6]}");

            var deleteResp = await _fixture.Client.DeleteAsync($"/api/v1/admin/access-control/positions/{posId}");
            deleteResp.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetPositionById_WithNonExistentId_Returns404()
        {
            var response = await _fixture.Client.GetAsync("/api/v1/admin/access-control/positions/999999");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdatePosition_WithNonExistentId_Returns404()
        {
            var response = await _fixture.Client.PutAsJsonAsync("/api/v1/admin/access-control/positions/999999", new
            {
                name = "Inexistente",
                departmentId = _testDepartmentId,
                newDepartmentName = (string?)null,
                isActive = true,
                accesses = Array.Empty<object>()
            });
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeletePosition_WithNonExistentId_Returns404()
        {
            var response = await _fixture.Client.DeleteAsync("/api/v1/admin/access-control/positions/999999");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetAccessControl_WhenNotAuthenticated_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var response = await anon.Client.GetAsync("/api/v1/admin/access-control");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task DeleteDepartment_WithPositions_ReturnsBadRequest()
        {
            // _testDepartmentId was created in InitializeAsync and might be used by positions
            // But let's create a new one and a position in it to be sure
            var deptResp = await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/departments", new { name = "Dept With Pos" });
            var deptBody = await deptResp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(deptBody);
            var deptId = doc.RootElement.GetProperty("data").GetProperty("id").GetInt32();

            await _fixture.Client.PostAsJsonAsync("/api/v1/admin/access-control/positions", new
            {
                name = "Pos In Dept",
                departmentId = deptId,
                isActive = true,
                accesses = Array.Empty<object>()
            });

            var deleteResp = await _fixture.Client.DeleteAsync($"/api/v1/admin/access-control/departments/{deptId}");
            deleteResp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task DeletePosition_WithLinkedUsers_ReturnsBadRequest()
        {
            // SeedPositionId 1 is used by admin user
            var response = await _fixture.Client.DeleteAsync("/api/v1/admin/access-control/positions/1");
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}
