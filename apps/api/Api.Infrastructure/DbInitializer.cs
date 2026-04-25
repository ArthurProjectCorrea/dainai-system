using Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Infrastructure
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context, UserManager<User> userManager)
        {
            await context.Database.EnsureCreatedAsync();

            // 1. Screens
            var screenSeeds = new List<Screen>
            {
                new Screen { Name = "Controle de Acesso", NameSidebar = "Controle de Acesso", NameKey = "access_control" },
                new Screen { Name = "Gerência de Usuários", NameSidebar = "Usuários", NameKey = "users_management" },
                new Screen { Name = "Gerência de Equipes", NameSidebar = "Equipes", NameKey = "teams_management" },
                new Screen { Name = "Gerência de Projetos", NameSidebar = "Projetos", NameKey = "projects_management" },
                new Screen { Name = "Gerência de Documentos", NameSidebar = "Documentos", NameKey = "documents_management" }
            };

            foreach (var screenSeed in screenSeeds)
            {
                var screen = context.Screens.FirstOrDefault(s => s.NameKey == screenSeed.NameKey);
                if (screen == null)
                {
                    context.Screens.Add(screenSeed);
                }
                else
                {
                    screen.Name = screenSeed.Name;
                    screen.NameSidebar = screenSeed.NameSidebar;
                }
            }

            // 2. Permissions
            var permissionSeeds = new List<Permission>
            {
                new Permission { Name = "Criar", NameKey = "create" },
                new Permission { Name = "Editar", NameKey = "update" },
                new Permission { Name = "Excluir", NameKey = "delete" },
                new Permission { Name = "Visualizar", NameKey = "view" },
                new Permission { Name = "Aprovar", NameKey = "approve" }
            };

            foreach (var permissionSeed in permissionSeeds)
            {
                var permission = context.Permissions.FirstOrDefault(p => p.NameKey == permissionSeed.NameKey);
                if (permission == null)
                {
                    context.Permissions.Add(permissionSeed);
                }
                else
                {
                    permission.Name = permissionSeed.Name;
                }
            }

            // 3. Departments
            var department = context.Departments.FirstOrDefault(d => d.Name == "TI");
            if (department == null)
            {
                department = new Department { Name = "TI" };
                context.Departments.Add(department);
            }
            else
            {
                department.Name = "TI";
            }

            // 4. Positions
            var posAdmin = context.Positions.FirstOrDefault(p => p.Name == "Administrador do Sistema");
            if (posAdmin == null)
            {
                posAdmin = new Position { Name = "Administrador do Sistema", DepartmentId = department.Id };
                context.Positions.Add(posAdmin);
            }
            else
            {
                posAdmin.Name = "Administrador do Sistema";
                posAdmin.DepartmentId = department.Id;
            }

            var posOperacional = context.Positions.FirstOrDefault(p => p.Name == "Analista Operacional");
            if (posOperacional == null)
            {
                posOperacional = new Position { Name = "Analista Operacional", DepartmentId = department.Id };
                context.Positions.Add(posOperacional);
            }
            else
            {
                posOperacional.Name = "Analista Operacional";
                posOperacional.DepartmentId = department.Id;
            }

            // 5. Teams
            var teamId = Guid.Parse("d1000000-0000-0000-0000-000000000001");
            var team = context.Teams.FirstOrDefault(t => t.Id == teamId);
            if (team == null)
            {
                team = new Team { Id = teamId, Name = "Time Principal" };
                context.Teams.Add(team);
            }
            else
            {
                team.Name = "Time Principal";
            }

            var teamOperacionalId = Guid.Parse("d1000000-0000-0000-0000-000000000002");
            var teamOperacional = context.Teams.FirstOrDefault(t => t.Id == teamOperacionalId);
            if (teamOperacional == null)
            {
                teamOperacional = new Team { Id = teamOperacionalId, Name = "Time Operacional" };
                context.Teams.Add(teamOperacional);
            }
            else
            {
                teamOperacional.Name = "Time Operacional";
            }

            await context.SaveChangesAsync();

            // 6. Accesses (Full access for pos 1)
            var screens = context.Screens.ToList();
            var perms = context.Permissions.ToList();

            foreach (var screen in screens)
            {
                foreach (var permission in perms)
                {
                    var accessExists = context.Accesses.Any(a => a.PositionId == posAdmin.Id && a.ScreenId == screen.Id && a.PermissionId == permission.Id);
                    if (!accessExists)
                    {
                        var isScopedScreen = screen.NameKey == "projects_management" || screen.NameKey == "documents_management";
                        var scopeValue = isScopedScreen ? "all" : null;
                        context.Accesses.Add(new Access { PositionId = posAdmin.Id, ScreenId = screen.Id, PermissionId = permission.Id, Scope = scopeValue });
                    }
                    else
                    {
                        // Update existing seeds to respect the new null requirement
                        var existingAccess = context.Accesses.First(a => a.PositionId == posAdmin.Id && a.ScreenId == screen.Id && a.PermissionId == permission.Id);
                        var isScopedScreen = screen.NameKey == "projects_management" || screen.NameKey == "documents_management";
                        existingAccess.Scope = isScopedScreen ? "all" : null;
                    }
                }
            }

            // 7. Initial Admin User
            var adminEmail = "admin@empresa.com";
            var adminUser = await CreateOrUpdateUser(userManager, adminEmail, "Admin123!");

            // 7.1. Brute Force Test User
            var bruteForceEmail = "lockout-test@dainai.local";
            await CreateOrUpdateUser(userManager, bruteForceEmail, "Admin123!");

            // 8. Profile
            var profile = await context.Profiles.FirstOrDefaultAsync(p => p.UserId == adminUser.Id);
            if (profile == null)
            {
                profile = new Profile { Id = adminUser.Id, UserId = adminUser.Id, Name = "Administrador Root" };
                context.Profiles.Add(profile);
            }
            else
            {
                profile.Name = "Administrador Root";
                profile.IsActive = true;
            }

            await context.SaveChangesAsync();

            // 9. Link
            var profileTeam = context.ProfileTeams.FirstOrDefault(pt => pt.ProfileId == profile.Id && pt.TeamId == team.Id);
            if (profileTeam == null)
            {
                context.ProfileTeams.Add(new ProfileTeam { ProfileId = profile.Id, TeamId = team.Id, PositionId = posAdmin.Id });
            }
            else
            {
                profileTeam.PositionId = posAdmin.Id;
            }

            var profileTeamOperacional = context.ProfileTeams.FirstOrDefault(pt => pt.ProfileId == profile.Id && pt.TeamId == teamOperacional.Id);
            if (profileTeamOperacional == null)
            {
                context.ProfileTeams.Add(new ProfileTeam { ProfileId = profile.Id, TeamId = teamOperacional.Id, PositionId = posOperacional.Id });
            }
            else
            {
                profileTeamOperacional.PositionId = posOperacional.Id;
            }

            await context.SaveChangesAsync();
        }

        private static async Task<User> CreateOrUpdateUser(UserManager<User> userManager, string email, string password)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new User { Id = Guid.NewGuid(), UserName = email, Email = email, EmailConfirmed = true, LockoutEnabled = true };
                await userManager.CreateAsync(user, password);
            }
            else
            {
                user.UserName = email;
                user.EmailConfirmed = true;
                user.LockoutEnabled = true;
                user.AccessFailedCount = 0; // Reset failures on seed
                user.LockoutEnd = null; // Clear lockout on seed
                await userManager.UpdateAsync(user);

                if (await userManager.HasPasswordAsync(user))
                {
                    await userManager.RemovePasswordAsync(user);
                }
                await userManager.AddPasswordAsync(user, password);
            }
            return user;
        }
    }
}
