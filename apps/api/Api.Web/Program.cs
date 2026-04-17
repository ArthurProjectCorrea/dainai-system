using Api.Application.Interfaces;
using Api.Domain;
using Api.Infrastructure;
using Api.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration
var isTestMode = builder.Configuration.GetValue<bool>("TEST_MODE");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (isTestMode || string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("InMemoryDbForTesting"));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// 2. Identity Configuration
builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// 3. Authentication & Cookies
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.Name = "AuthToken";
        options.LoginPath = "/api/v1/auth/login";
        options.LogoutPath = "/api/v1/auth/logout";
    });

// 4. Caching (Redis or MemoryCache)
var redisConnectionString = builder.Configuration["Redis:ConnectionString"];
if (!string.IsNullOrWhiteSpace(redisConnectionString))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "dainai-api-";
    });
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// 5. Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IFeedbackIntegrationService, FeedbackIntegrationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// 6. Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// CORS Configuration for Next.js Web Client
var webClientUrl = builder.Configuration["App:WebClientUrl"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWebClient", policy =>
    {
        policy
            .WithOrigins(webClientUrl)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // Essential for cookies
    });
});
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 7. Pipeline Configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Dainai API v1");
        c.DocumentTitle = "Dainai API Docs";
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseCors("AllowWebClient");
app.UseAuthentication();
app.UseAuthorization();

// 8. Custom RBAC Middleware would go here
// app.UseMiddleware<RbacMiddleware>();

app.MapControllers();

// 9. Auto-Migrations & Seeding
if (app.Configuration.GetValue<bool>("SeedDatabase"))
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Executar Migrations Reais (Apenas se não for banco em memória)
        if (!context.Database.IsInMemory())
        {
            await context.Database.MigrateAsync();
        }

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        await DbInitializer.SeedAsync(context, userManager);
    }
}

app.Run();

public partial class Program { }
