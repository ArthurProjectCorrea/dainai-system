using Api.Application.DTOs;
using Api.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Web.Controllers
{
    [ApiController]
    [Route("api/v1/storage")]
    [Authorize]
    public class StorageController : ControllerBase
    {
        private readonly IFileService _fileService;

        public StorageController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ApiResponse<string>("400", "Nenhum arquivo enviado", null));

            // Validate extensions
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new ApiResponse<string>("400", "Extensão de arquivo não permitida", null));

            // Validate size (2MB)
            if (file.Length > 2 * 1024 * 1024)
                return BadRequest(new ApiResponse<string>("400", "O arquivo deve ter no máximo 2MB", null));

            try
            {
                var fileUrl = await _fileService.SaveFileAsync(file);
                return Ok(new ApiResponse<string>("200", "Upload realizado com sucesso", fileUrl));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>("500", $"Erro interno: {ex.Message}", null));
            }
        }
    }
}
