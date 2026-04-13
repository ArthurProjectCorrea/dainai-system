using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Screen : BaseEntity<int>
    {
        public string Name { get; set; } = null!;
        public string NameSidebar { get; set; } = null!;
        public string NameKey { get; set; } = null!; // Unique, cannot be changed in PUT

        public virtual ICollection<Access> Accesses { get; set; } = new List<Access>();
    }
}
