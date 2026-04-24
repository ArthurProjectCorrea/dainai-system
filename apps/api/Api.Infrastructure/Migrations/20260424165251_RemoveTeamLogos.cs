using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTeamLogos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IconUrl",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "LogotipoUrl",
                table: "Teams");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IconUrl",
                table: "Teams",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogotipoUrl",
                table: "Teams",
                type: "text",
                nullable: true);
        }
    }
}
