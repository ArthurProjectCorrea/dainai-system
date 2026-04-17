using System;

namespace Api.Domain
{
    public class DocumentCategory : BaseEntity<int>
    {
        public Guid DocumentId { get; set; }
        public virtual Document Document { get; set; } = null!;

        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;
    }
}
