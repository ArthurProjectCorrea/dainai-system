using Api.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IHostEnvironment _env;

        public FileService(IHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string subFolder = "uploads")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Nenhum arquivo enviado");

            var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", subFolder);
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/{subFolder}/{fileName}";
        }

        public void DeleteFile(string? fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return;

            try
            {
                // Only delete if it starts with leading slash and looks like our local upload path
                if (!fileUrl.StartsWith("/uploads/")) return;

                var fileName = Path.GetFileName(fileUrl);
                var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", fileName);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                // We log but don't throw to avoid breaking main business flow if deletion fails
                Console.WriteLine($"Erro ao deletar arquivo {fileUrl}: {ex.Message}");
            }
        }
    }
}
