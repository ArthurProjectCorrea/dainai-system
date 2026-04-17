using Api.Application.DTOs;
using Api.Application.Interfaces;
using Api.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Api.Infrastructure.Services
{
    public class FeedbackIntegrationService : IFeedbackIntegrationService
    {
        private readonly AppDbContext _context;

        public FeedbackIntegrationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<object>> UpsertFeedbackAsync(string integrationToken, PublicFeedbackRequest request)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.IntegrationToken == integrationToken && p.DeletedAt == null);

            if (project == null || !project.IsActive)
                return new ApiResponse<object>("401", "Invalid or inactive project token.", null);

            // Upsert mechanic
            var existingFeedback = await _context.ProjectFeedbacks
                .FirstOrDefaultAsync(pf => pf.ProjectId == project.Id && pf.RefUserId == request.RefUserId);

            if (existingFeedback != null)
            {
                existingFeedback.Note = request.Note;
                existingFeedback.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newFeedback = new ProjectFeedback
                {
                    Id = Guid.NewGuid(),
                    ProjectId = project.Id,
                    RefUserId = request.RefUserId,
                    Note = request.Note,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ProjectFeedbacks.Add(newFeedback);
            }

            await _context.SaveChangesAsync();

            return new ApiResponse<object>("200", "Feedback successfully registered.", null);
        }
    }
}
