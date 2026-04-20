using Api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;

class Program {
    static async Task Main(string[] args) {
        var host = Host.CreateDefaultBuilder(args)
            .ConfigureServices((hostContext, services) => {
                services.AddDbContext<AppDbContext>(options =>
                    options.UseNpgsql("Host=localhost;Database=apidb;Username=postgres;Password=postgres"));
            })
            .Build();

        using var scope = host.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var docs = await context.Documents.ToListAsync();
        Console.WriteLine($"Total Documents: {docs.Count}");
        foreach (var doc in docs) {
            Console.WriteLine($"ID: {doc.Id}, Name: {doc.Name}, Status: {doc.Status}");
            // Check if "permitindo" exists
            if (doc.Content.Contains("permitindo", StringComparison.OrdinalIgnoreCase)) {
                Console.WriteLine("  -> FOUND 'permitindo' in content");
            }
        }
    }
}
