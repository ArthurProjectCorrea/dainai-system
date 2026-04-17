using System;

namespace Api.Domain
{
    public class ProjectFeedback : BaseEntity<Guid>
    {
        public Guid ProjectId { get; set; }
        public virtual Project Project { get; set; } = null!;

        /// <summary>
        /// Unique identifier or hash matching the users from remote/external systems.
        /// </summary>
        public string RefUserId { get; set; } = null!;

        public int Note { get; set; }
    }
}
