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
                new Screen { Id = 1, Name = "Controle de Acesso", NameSidebar = "Controle de Acesso", NameKey = "access_control" },
                new Screen { Id = 2, Name = "Gerência de Usuários", NameSidebar = "Usuários", NameKey = "users_management" },
                new Screen { Id = 3, Name = "Gerência de Equipes", NameSidebar = "Equipes", NameKey = "teams_management" },
                new Screen { Id = 4, Name = "Gerência de Projetos", NameSidebar = "Projetos", NameKey = "projects_management" },
                new Screen { Id = 5, Name = "Gerência de Documentos", NameSidebar = "Documentos", NameKey = "documents_management" }
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
                new Permission { Id = 1, Name = "Criar", NameKey = "create" },
                new Permission { Id = 2, Name = "Editar", NameKey = "update" },
                new Permission { Id = 3, Name = "Excluir", NameKey = "delete" },
                new Permission { Id = 4, Name = "Visualizar", NameKey = "view" },
                new Permission { Id = 5, Name = "Publicar/Aprovar", NameKey = "approve" }
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
            var department = context.Departments.FirstOrDefault(d => d.Id == 1);
            if (department == null)
            {
                department = new Department { Id = 1, Name = "TI" };
                context.Departments.Add(department);
            }
            else
            {
                department.Name = "TI";
            }

            // 4. Positions
            var posAdmin = context.Positions.FirstOrDefault(p => p.Id == 1);
            if (posAdmin == null)
            {
                posAdmin = new Position { Id = 1, Name = "Administrador do Sistema", DepartmentId = department.Id };
                context.Positions.Add(posAdmin);
            }
            else
            {
                posAdmin.Name = "Administrador do Sistema";
                posAdmin.DepartmentId = department.Id;
            }

            var posOperacional = context.Positions.FirstOrDefault(p => p.Id == 2);
            if (posOperacional == null)
            {
                posOperacional = new Position { Id = 2, Name = "Analista Operacional", DepartmentId = department.Id };
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
            var user = await userManager.FindByEmailAsync(adminEmail);
            if (user == null)
            {
                user = new User { Id = Guid.NewGuid(), UserName = adminEmail, Email = adminEmail, EmailConfirmed = true };
                await userManager.CreateAsync(user, "Admin123!");
            }
            else
            {
                user.UserName = adminEmail;
                user.EmailConfirmed = true;
                await userManager.UpdateAsync(user);

                if (await userManager.HasPasswordAsync(user))
                {
                    var removePasswordResult = await userManager.RemovePasswordAsync(user);
                    if (!removePasswordResult.Succeeded)
                    {
                        throw new InvalidOperationException("Não foi possível limpar a senha do usuário admin durante o seed.");
                    }
                }

                var addPasswordResult = await userManager.AddPasswordAsync(user, "Admin123!");
                if (!addPasswordResult.Succeeded)
                {
                    throw new InvalidOperationException("Não foi possível definir a senha do usuário admin durante o seed.");
                }
            }

            // 8. Profile
            var profile = await context.Profiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (profile == null)
            {
                profile = new Profile { Id = user.Id, UserId = user.Id, Name = "Administrador Root" };
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
    }
}
