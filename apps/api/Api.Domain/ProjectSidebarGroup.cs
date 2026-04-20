using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public enum SidebarGroupType
    {
        Solo,
        List,
        Collapse,
        Dropdown
    }

    public class ProjectSidebarGroup : BaseEntity<Guid>
    {
        public Guid ProjectId { get; set; }
        public virtual Project Project { get; set; } = null!;

        public string Title { get; set; } = null!;
        public SidebarGroupType Type { get; set; } = SidebarGroupType.List;
        public int Order { get; set; }
        public string? Icon { get; set; }

        public virtual ICollection<ProjectSidebarItem> Items { get; set; } = new List<ProjectSidebarItem>();
    }
}
