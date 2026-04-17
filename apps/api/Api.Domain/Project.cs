using System;

namespace Api.Domain
{
    public class Project : BaseEntity<Guid>
    {
        public string Name { get; set; } = null!;
        public Guid TeamId { get; set; }
        public virtual Team Team { get; set; } = null!;

        /// <summary>
        /// A uniquely generated token for external integrations to submit Feedback without auth headers.
        /// </summary>
        public string IntegrationToken { get; set; } = null!;

        public bool IsActive { get; set; } = true;

        public virtual System.Collections.Generic.ICollection<ProjectFeedback> Feedbacks { get; set; } = new System.Collections.Generic.List<ProjectFeedback>();
    }
}
