using Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace Api.Infrastructure
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Profile> Profiles { get; set; } = null!;
        public DbSet<Team> Teams { get; set; } = null!;
        public DbSet<ProfileTeam> ProfileTeams { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Position> Positions { get; set; } = null!;
        public DbSet<Screen> Screens { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<Access> Accesses { get; set; } = null!;
        public DbSet<OtpAttempt> OtpAttempts { get; set; } = null!;

        // Projects & Feedbacks Module
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<ProjectFeedback> ProjectFeedbacks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // User -> Profile (1:1)
            builder.Entity<Profile>()
                .HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(p => p.UserId);

            // Access Table Configuration
            builder.Entity<Access>()
                .HasOne(a => a.Position)
                .WithMany(p => p.Accesses)
                .HasForeignKey(a => a.PositionId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade Delete required!

            builder.Entity<Access>()
                .HasOne(a => a.Screen)
                .WithMany(s => s.Accesses)
                .HasForeignKey(a => a.ScreenId);

            builder.Entity<Access>()
                .HasOne(a => a.Permission)
                .WithMany(p => p.Accesses)
                .HasForeignKey(a => a.PermissionId);

            // Unique Key for Screens
            builder.Entity<Screen>()
                .HasIndex(s => s.NameKey)
                .IsUnique();

            // Project Integration Token UK
            builder.Entity<Project>()
                .HasIndex(p => p.IntegrationToken)
                .IsUnique();

            // Project Feedback Prevent Duplicates UK (Upsert Anchor)
            builder.Entity<ProjectFeedback>()
                .HasIndex(pf => new { pf.ProjectId, pf.RefUserId })
                .IsUnique();
        }
    }
}
