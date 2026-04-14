using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Api.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string subFolder = "uploads");
        void DeleteFile(string? fileUrl);
    }
}
