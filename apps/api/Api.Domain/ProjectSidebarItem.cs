using System;

namespace Api.Domain
{
    public class ProjectSidebarItem : BaseEntity<Guid>
    {
        public Guid GroupId { get; set; }
        public virtual ProjectSidebarGroup Group { get; set; } = null!;

        public Guid DocumentId { get; set; }
        public virtual Document Document { get; set; } = null!;

        public int Order { get; set; }
    }
}
