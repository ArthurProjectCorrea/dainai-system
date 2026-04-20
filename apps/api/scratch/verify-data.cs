using Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) => {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql("Host=localhost;Database=apidb;Username=postgres;Password=postgres"));
    })
    .Build();

using var scope = host.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

var docs = await context.Documents.Where(d => d.Status == Api.Domain.DocumentStatus.Published).ToListAsync();
Console.WriteLine($"Found {docs.Count} published documents.");
foreach (var d in docs) {
    Console.WriteLine($"ID: {d.Id}, Name: {d.Name}");
    // Console.WriteLine($"Content: {d.Content.Substring(0, Math.Min(100, d.Content.Length))}");
    if (d.Content.ToLower().Contains("permitindo")) {
        Console.WriteLine("--- FOUND 'permitindo' in documentation ---");
    }
}
