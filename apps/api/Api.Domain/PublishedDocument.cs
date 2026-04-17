using System;

namespace Api.Domain
{
    public class PublishedDocument : BaseEntity<Guid>
    {
        public Guid DocumentId { get; set; }
        public virtual Document Document { get; set; } = null!;

        public string Version { get; set; } = null!;
        public string Content { get; set; } = null!;

        public Guid PublishedById { get; set; }
        public virtual Profile PublishedBy { get; set; } = null!;
    }
}
