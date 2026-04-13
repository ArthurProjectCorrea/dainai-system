using Api.Application.Utils;
using FluentAssertions;
using Xunit;

namespace Api.Tests
{
    public class AuthUnitTests
    {
        [Fact]
        public void PasswordGenerator_ShouldGenerateRandomPassword()
        {
            // Act
            var pass1 = PasswordGenerator.Generate();
            var pass2 = PasswordGenerator.Generate();

            // Assert
            pass1.Should().NotBeNullOrEmpty();
            pass1.Length.Should().Be(12);
            pass1.Should().NotBe(pass2);
        }
    }
}
