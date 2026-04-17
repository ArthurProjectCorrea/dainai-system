using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public enum DocumentStatus
    {
        Draft,
        Completed,
        Published
    }

    public class Document : BaseEntity<Guid>
    {
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public string Name { get; set; } = null!;
        public string Content { get; set; } = "";
        public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

        public Guid CreatedById { get; set; }
        public Profile CreatedBy { get; set; } = null!;

        public Guid UpdatedById { get; set; }
        public Profile UpdatedBy { get; set; } = null!;

        public ICollection<DocumentCategory> DocumentCategories { get; set; } = new List<DocumentCategory>();
        public ICollection<PublishedDocument> PublishedDocuments { get; set; } = new List<PublishedDocument>();
    }
}
