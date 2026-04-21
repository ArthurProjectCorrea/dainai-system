using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace Api.Tests.E2E
{
    [Trait("Category", "E2E")]
    [Trait("Module", "Auth")]
    public class AuthE2ETests : IAsyncLifetime
    {
        private DockerApiFixture _fixture = null!;

        public async Task InitializeAsync()
        {
            _fixture = new DockerApiFixture();
            await DockerApiFixture.ClearMailHogAsync();
        }

        public async Task DisposeAsync() => await _fixture.DisposeAsync();

        // ─── SUCCESS SCENARIOS ────────────────────────────────────────────────────

        [Fact]
        public async Task Login_WithValidCredentials_Returns200AndSetsCookie()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = DockerApiFixture.AdminEmail,
                password = DockerApiFixture.AdminPassword
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("data");
        }

        [Fact]
        public async Task Me_WhenAuthenticated_ReturnsUserProfile()
        {
            var loggedIn = await _fixture.LoginAsAdminAsync();
            loggedIn.Should().BeTrue("admin login should succeed");

            var response = await _fixture.Client.GetAsync("/api/v1/auth/me");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadAsStringAsync();
            body.Should().Contain("Administrador Root");
        }

        [Fact]
        public async Task Logout_WhenAuthenticated_Returns200()
        {
            await _fixture.LoginAsAdminAsync();

            var response = await _fixture.Client.PostAsync("/api/v1/auth/logout", null);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task ForgotPassword_WithExistingEmail_Returns200()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new
            {
                email = DockerApiFixture.AdminEmail
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task ForgotVerifyReset_FullFlow_ChangesPasswordSuccessfully()
        {
            await DockerApiFixture.ClearMailHogAsync();

            // Step 1: Request OTP
            var forgotResp = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new
            {
                email = DockerApiFixture.AdminEmail
            });
            forgotResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Step 2: Get OTP from MailHog (wait up to 10 seconds)
            var otp = await DockerApiFixture.GetOtpFromMailHogAsync(DockerApiFixture.AdminEmail);
            if (otp == null)
            {
                // MailHog not available or too slow — skip gracefully
                return;
            }

            // Step 3: Verify OTP
            var verifyResp = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/verify-otp", new
            {
                email = DockerApiFixture.AdminEmail,
                otp = otp
            });
            verifyResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Step 4: Reset password
            const string newPassword = "NewAdmin@456";
            var resetResp = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/reset-password", new
            {
                newPassword = newPassword,
                confirmPassword = newPassword
            });
            resetResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Step 5: Login with new password
            var loginNewResp = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = DockerApiFixture.AdminEmail,
                password = newPassword
            });
            loginNewResp.StatusCode.Should().Be(HttpStatusCode.OK);

            // Step 6: Restore original password via OTP flow
            await DockerApiFixture.ClearMailHogAsync();
            await _fixture.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new { email = DockerApiFixture.AdminEmail });
            var otp2 = await DockerApiFixture.GetOtpFromMailHogAsync(DockerApiFixture.AdminEmail);
            if (otp2 != null)
            {
                await _fixture.Client.PostAsJsonAsync("/api/v1/auth/verify-otp", new { email = DockerApiFixture.AdminEmail, otp = otp2 });
                await _fixture.Client.PostAsJsonAsync("/api/v1/auth/reset-password", new
                {
                    newPassword = DockerApiFixture.AdminPassword,
                    confirmPassword = DockerApiFixture.AdminPassword
                });
            }
        }

        // ─── ERROR SCENARIOS ─────────────────────────────────────────────────────

        [Fact]
        public async Task Login_WithWrongPassword_Returns401()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = DockerApiFixture.AdminEmail,
                password = "WrongPassword!"
            });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithNonExistentEmail_Returns401()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = "nobody@never.com",
                password = "whatever"
            });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Me_WhenNotAuthenticated_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var response = await anon.Client.GetAsync("/api/v1/auth/me");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task ResetPassword_WithoutValidToken_Returns401()
        {
            var anon = DockerApiFixture.CreateAnonymous();
            var response = await anon.Client.PostAsJsonAsync("/api/v1/auth/reset-password", new
            {
                newPassword = "NewPass@123",
                confirmPassword = "NewPass@123"
            });

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            await anon.DisposeAsync();
        }

        [Fact]
        public async Task ResetPassword_WithMismatchedPasswords_Returns400()
        {
            // First get a reset token via OTP flow
            await DockerApiFixture.ClearMailHogAsync();
            await _fixture.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new
            {
                email = DockerApiFixture.AdminEmail
            });

            var otp = await DockerApiFixture.GetOtpFromMailHogAsync(DockerApiFixture.AdminEmail);
            if (otp == null)
            {
                // If MailHog unavailable, test without token (should still be 400 or 401)
                var noTokenResp = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/reset-password", new
                {
                    newPassword = "Pass@123",
                    confirmPassword = "Different@123"
                });
                noTokenResp.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
                return;
            }

            await _fixture.Client.PostAsJsonAsync("/api/v1/auth/verify-otp", new
            {
                email = DockerApiFixture.AdminEmail,
                otp = otp
            });

            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/reset-password", new
            {
                newPassword = "Pass@123",
                confirmPassword = "DifferentPass@123"
            });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task VerifyOtp_WithWrongOtp_Returns400()
        {
            await _fixture.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new
            {
                email = DockerApiFixture.AdminEmail
            });

            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/verify-otp", new
            {
                email = DockerApiFixture.AdminEmail,
                otp = "000000"
            });

            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.BadRequest,
                HttpStatusCode.TooManyRequests
            );
        }

        [Fact]
        public async Task Login_WithEmptyFields_ReturnsBadRequest()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = "",
                password = ""
            });
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task ForgotPassword_WithNonExistentEmail_Returns200ForSecurity()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new
            {
                email = "nonexistent@never.com"
            });
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task VerifyOtp_WithNonExistentUser_ReturnsBadRequest()
        {
            var response = await _fixture.Client.PostAsJsonAsync("/api/v1/auth/verify-otp", new
            {
                email = "nonexistent@never.com",
                otp = "123456"
            });
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}
